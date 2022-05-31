import json
import contextlib
from rest_framework.response import Response
from rest_framework import generics, status

from api.models import Cache
from api.serializers import CacheSerializer
from utils.cache import get_cache_data
from .utils import get_template_obj


class ViewGenericAPIView(generics.GenericAPIView):
    permission_classes = []

    def get(self, request, template_id):
        stage = request.GET.get("stage", 1)
        if _ := get_template_obj(template_id):
            with contextlib.suppress(Cache.DoesNotExist):
                cache_obj = Cache.objects.get(template_id=template_id, stage=stage)

                if cache_obj.public:
                    cache_obj_serialized = CacheSerializer(cache_obj).data
                    if cached_data := get_cache_data(cache_obj_serialized):
                        return Response(json.loads(cached_data))

        return Response({}, status=status.HTTP_404_NOT_FOUND)
