import json
import contextlib
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from api.worker import worker
from api.serializers import TemplateSerializer, CacheSerializer
from api.models import Template, Cache
from api.filters import FilterByOrg
from organizations.utils import get_user_org
from utils.utils import parse_template, compile_template
from utils.log import log
from utils.cache import (
    save_to_cache,
    clear_cache,
    clear_cache_file,
    get_cached_results,
    arrange_results,
)
from .utils import (
    get_connectors,
    get_or_create_cache_obj,
    get_template_obj,
    generate_update_key,
)


def run(cache_obj, org, background=0):
    cache_obj_data = CacheSerializer(cache_obj).data
    template_id = cache_obj_data["template_id"]
    stage = cache_obj_data["stage"]
    errors_col = []

    if not (template_obj := get_template_obj(template_id, org=org)):
        errors_col.append("template not found")

    if tmpl_code := template_obj.code:
        try:
            connectors = get_connectors(org)
            template_data = compile_template(tmpl_code, connectors)

            if not background:
                raw, valid, errors = parse_template(
                    tmpl_code, template_data, cache_obj_data
                )

                if valid and stage == 1:
                    latest = json.dumps(json.loads(raw), separators=(",", ":"))
                    save_to_cache(
                        cache_obj_data["uuid"],
                        cache_obj_data["storage"],
                        "latest",
                        latest,
                    )
                    cache_obj.task_status = 2
                    cache_obj.public = 1

                if stage == 0:
                    save_to_cache(
                        cache_obj_data["uuid"],
                        cache_obj_data["storage"],
                        "raw",
                        f"#{raw}#",
                    )
                    cache_obj.task_status = 2

                if errors:
                    errors_col.append(errors)
                    cache_obj.task_status = 1

                cache_obj.save()

            if background:
                update_key = generate_update_key()
                cache_obj.update_key = update_key
                cache_obj.save()

                if stage == 1:
                    task = worker.send_task(
                        "parseTemplate",
                        (tmpl_code, template_data, cache_obj_data, update_key),
                    )
                if stage == 0:
                    task = worker.send_task(
                        "testTemplate",
                        (tmpl_code, template_data, cache_obj_data, update_key),
                    )

                cache_obj.task_id = task.task_id
                cache_obj.save()
        except Exception as e:
            errors_col.append(str(e))

        if not background and len(errors_col):
            log(
                cache_obj_data["uuid"],
                cache_obj_data["storage"],
                "errors",
                json.dumps(errors_col),
            )


class TemplateListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TemplateSerializer
    queryset = Template.objects.all()

    def filter_queryset(self, queryset):
        filter_backends = (FilterByOrg,)

        for backend in list(filter_backends):
            queryset = backend().filter_queryset(self.request, queryset, view=self)

        return queryset

    def list(self, request):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(str(e), status=status.HTTP_400_BAD_REQUEST)

    def create(self, request, *args, **kwargs):
        org = get_user_org(request.user)
        data = {**{"org": org.pk, **request.data}}
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )


class TemplateGenericAPIView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TemplateSerializer
    queryset = Template.objects.all()

    def get(self, request, template_id):
        org = get_user_org(request.user)
        if template_obj := get_template_obj(template_id, org=org):
            return Response(TemplateSerializer(template_obj).data)
        return Response({}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, template_id):
        org = get_user_org(request.user)
        if template_obj := get_template_obj(template_id, org=org):
            data = request.data
            serializer = TemplateSerializer(template_obj, data=data)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
        return Response({}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, template_id):
        org = get_user_org(request.user)
        if template_obj := get_template_obj(template_id, org=org):
            template_obj.delete()
            caches = Cache.objects.filter(template_id=template_id)

            for cache in caches:
                cache.delete()
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        return Response({}, status=status.HTTP_404_NOT_FOUND)


class TemplateUndeploy(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, template_id, stage):
        org = get_user_org(request.user)
        if _ := get_template_obj(template_id, org=org):
            with contextlib.suppress(Cache.DoesNotExist):
                cache_obj = Cache.objects.get(template_id=template_id, stage=stage)
                cache_obj.public = 0
                cache_obj.save()
                clear_cache(cache_obj.uuid, cache_obj.storage)
                return Response(CacheSerializer(cache_obj).data)

        return Response({}, status=status.HTTP_404_NOT_FOUND)


class TemplateDeploy(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, template_id):
        run_in_background = int(request.GET.get("runInBackground", 0))
        resp = {"cache": None, "results": None}
        org = get_user_org(request.user)
        cache_obj = get_or_create_cache_obj(template_id, org, stage=1)

        clear_cache_file(cache_obj.uuid, "errors", cache_obj.storage)
        clear_cache_file(cache_obj.uuid, "logs", cache_obj.storage)
        run(cache_obj, org, background=run_in_background)

        if run_in_background:
            cache_obj.task_status = 3

        if not run_in_background:
            root = f"/home/cache/{cache_obj.uuid}"
            cached_results = arrange_results(get_cached_results(root, root, {}))

            with contextlib.suppress(KeyError):
                if "errors" not in cached_results:
                    cache_obj.public = 1
                else:
                    cache_obj.task_status = 1

            resp["results"] = cached_results

        cache_obj.save()
        resp["cache"] = CacheSerializer(cache_obj).data
        return Response(resp)


class TemplateTest(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, template_id):
        run_in_background = int(request.GET.get("runInBackground", 0))
        resp = {"cache": None, "results": None}
        org = get_user_org(request.user)
        cache_obj = get_or_create_cache_obj(template_id, org, stage=0)

        clear_cache(cache_obj.uuid, cache_obj.storage)
        run(cache_obj, org, background=run_in_background)

        if not run_in_background:
            root = f"/home/cache/{cache_obj.uuid}"
            resp["results"] = arrange_results(get_cached_results(root, root, {}))
            cache_obj.task_status = 2
        else:
            cache_obj.task_status = 3

        cache_obj.save()
        resp["cache"] = CacheSerializer(cache_obj).data
        return Response(resp)


class TemplateDeployStatus(generics.GenericAPIView):
    permission_classes = [IsAuthenticated | AllowAny]

    def get(self, request, template_id, stage):
        if request.user.is_anonymous:
            return Response({}, status=status.HTTP_401_UNAUTHORIZED)

        org = get_user_org(request.user)
        if _ := get_template_obj(template_id, org=org):
            with contextlib.suppress(Cache.DoesNotExist):
                cache_obj = Cache.objects.get(template_id=template_id, stage=stage)
                return Response(CacheSerializer(cache_obj).data)

        return Response({}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, template_id, stage):
        update_key = request.data.get("update_key", None)
        org = None if request.user.is_anonymous else get_user_org(request.user)

        if not org and not update_key:
            return Response({}, status=status.HTTP_404_NOT_FOUND)

        if _ := get_template_obj(template_id, org=org):
            with contextlib.suppress(Cache.DoesNotExist):
                data = request.data
                task_status = data.get("task_status", None)
                public = data.get("public", None)

                if update_key:
                    cache_obj = Cache.objects.get(
                        template_id=template_id, stage=stage, update_key=update_key
                    )
                else:
                    cache_obj = Cache.objects.get(template_id=template_id, stage=stage)

                cache_obj.task_status = int(task_status)

                if task_status:
                    cache_obj.task_status = int(task_status)
                if public:
                    cache_obj.public = int(public)

                cache_obj.save()
                return Response(CacheSerializer(cache_obj).data)

        return Response({}, status=status.HTTP_404_NOT_FOUND)


class TemplateTestResults(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, template_id, stage):
        org = get_user_org(request.user)
        cache_obj = get_or_create_cache_obj(template_id, org, stage=stage)
        root = f"/home/cache/{cache_obj.uuid}"
        cached_results = arrange_results(get_cached_results(root, root, {}))

        resp = {"cache": CacheSerializer(cache_obj).data, "results": cached_results}
        return Response(resp)
