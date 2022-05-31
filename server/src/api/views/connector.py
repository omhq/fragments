from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.serializers import ConnectorSerializer
from api.models import Connector
from api.filters import FilterByOrg

from organizations.utils import get_user_org

from .utils import get_connector_obj


class ConnectorListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ConnectorSerializer
    queryset = Connector.objects.all()

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


class ConnectorGenericAPIView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ConnectorSerializer
    queryset = Connector.objects.all()

    def get(self, request, connector_id):
        try:
            org = get_user_org(request.user)
            if connector_obj := get_connector_obj(connector_id, org):
                return Response(ConnectorSerializer(connector_obj).data)
        except Exception as e:
            return Response(str(e), status=status.HTTP_400_BAD_REQUEST)

        return Response({}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, connector_id):
        org = get_user_org(request.user)
        if connector_obj := get_connector_obj(connector_id, org):
            data = request.data
            serializer = ConnectorSerializer(connector_obj, data=data)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
        return Response({}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, connector_id):
        org = get_user_org(request.user)
        if connector_obj := get_connector_obj(connector_id, org):
            connector_obj.delete()
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        return Response({}, status=status.HTTP_404_NOT_FOUND)
