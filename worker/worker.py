import os
import json
import requests
from celery import Celery
from utils.cache import save_to_cache
from utils.utils import parse_template


API_SERVER_URL = os.environ.get("API_SERVER_URL")
BROKER_URL = os.environ.get("BROKER_URL")
worker = Celery("worker", broker=BROKER_URL, backend=BROKER_URL)


def update_cache(template_id, stage, status_payload):
    requests.post(
        url=f"{API_SERVER_URL}/v1/templates/deploy/status/{template_id}/{stage}/",
        data=status_payload,
    )


@worker.task(name="parseTemplate")
def parse(tmpl_code, template_data, cache_obj, update_key):
    template_id = cache_obj["template_id"]
    stage = cache_obj["stage"]
    errors_col = []
    status_payload = {"update_key": update_key}

    try:
        raw, valid, errors = parse_template(tmpl_code, template_data, cache_obj)

        if valid:
            latest = json.dumps(json.loads(raw), separators=(",", ":"))
            save_to_cache(cache_obj["uuid"], cache_obj["storage"], "latest", latest)
            status_payload["task_status"] = 2
            status_payload["public"] = 1

        if errors:
            errors_col.append(errors)
            status_payload["task_status"] = 1
    except Exception as e:
        status_payload["task_status"] = 1
        errors_col.append(str(e))

    if len(errors_col):
        save_to_cache(
            cache_obj["uuid"], cache_obj["storage"], "errors", json.dumps(errors_col)
        )
    update_cache(template_id, stage, status_payload)


@worker.task(name="testTemplate")
def parse(tmpl_code, template_data, cache_obj, update_key):
    template_id = cache_obj["template_id"]
    stage = cache_obj["stage"]
    errors_col = []
    status_payload = {"task_status": 2, "update_key": update_key}

    try:
        raw, _, errors = parse_template(tmpl_code, template_data, cache_obj)

        if errors:
            status_payload["task_status"] = 1
            errors_col.append(errors)

        save_to_cache(cache_obj["uuid"], cache_obj["storage"], "raw", f"#{raw}#")
    except Exception as e:
        status_payload["task_status"] = 1
        errors_col.append(str(e))

    if len(errors_col):
        save_to_cache(
            cache_obj["uuid"], cache_obj["storage"], "errors", json.dumps(errors_col)
        )
    update_cache(template_id, stage, status_payload)
