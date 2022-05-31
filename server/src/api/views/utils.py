import os
import json
import uuid
import base64
import contextlib
from api.serializers import ConnectorSerializer
from api.models import Connector, Cache, Template


CACHE_STORAGE = os.environ.get("CACHE_STORAGE", "local")
CACHE_STORAGE_LU = {"local": 0}


def generate_update_key():
    return base64.urlsafe_b64encode(os.urandom(6)).decode()


def get_template_obj(id, org=None):
    with contextlib.suppress(Template.DoesNotExist):
        if org:
            return Template.objects.get(pk=id, org=org)
        return Template.objects.get(pk=id)
    return None


def get_connector_obj(id, org):
    with contextlib.suppress(Connector.DoesNotExist):
        return Connector.objects.get(pk=id, org=org)
    return None


def get_connectors(org):
    connectors = {}
    connector_objects = Connector.objects.filter(org=org)

    for connector in connector_objects:
        with contextlib.suppress(json.decoder.JSONDecodeError):
            data = json.loads(ConnectorSerializer(connector).data["data"])
            global_name = data["global_name"]
            del data["global_name"]
            connectors[global_name] = data
    return connectors


def get_or_create_cache_obj(template_id, org, stage=0):
    try:
        return Cache.objects.get(
            template_id=template_id,
            stage=stage,
            org=org,
            storage=CACHE_STORAGE_LU[CACHE_STORAGE],
        )
    except Cache.DoesNotExist:
        new_uuid = uuid.uuid4()
        cache_obj = Cache(
            uuid=new_uuid,
            template_id=template_id,
            task_id=None,
            storage=CACHE_STORAGE_LU[CACHE_STORAGE],
            stage=stage,
            org=org,
            path=f"{new_uuid}",
        )
        cache_obj.save()
        return cache_obj
