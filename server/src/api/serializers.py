from rest_framework import serializers
from .models import Template, Connector, Cache


class TemplateSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = Template
        fields = "__all__"


class DataField(serializers.Field):
    def to_representation(self, value):
        return value

    def to_internal_value(self, data):
        return data


class ConnectorSerializer(serializers.ModelSerializer):
    data = serializers.CharField()

    class Meta(object):
        model = Connector
        fields = "__all__"


class CacheSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = Cache
        fields = "__all__"


class UserSelfSerializer(serializers.Serializer):
    pk = serializers.IntegerField()
    username = serializers.CharField(max_length=200)
    first_name = serializers.CharField(max_length=200)
    last_name = serializers.CharField(max_length=200)
    email = serializers.CharField(max_length=200)
