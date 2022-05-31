from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .utils import get_or_create_cache_obj
from api.serializers import CacheSerializer
from organizations.utils import get_user_org


class CacheGenericAPIView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        stage = request.GET.get("stage", None)
        template_id = request.GET.get("template_id", None)
        if template_id and stage:
            org = get_user_org(request.user)
            cache_obj = get_or_create_cache_obj(template_id, org, stage=stage)
            return Response(CacheSerializer(cache_obj).data)

        return Response({}, status=status.HTTP_404_NOT_FOUND)
