import re
import json
import requests
import uuid
from functools import wraps
from jinja2 import Environment, BaseLoader, meta, pass_context
from .log import log
from .psql import psql


def log_http_result(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        ctx = args[0]
        function_args = args[1]
        logger_name = f"http-{str(uuid.uuid4())[:8]}"
        cache_uuid = ctx["CACHE_UUID"]
        storage_type = ctx["STORAGE_TYPE"]
        result = fn(*args, **kwargs)
        url = function_args["url"]

        log(cache_uuid, storage_type, "logs", f"GET {url}", logger_name=logger_name)
        log(cache_uuid, storage_type, "logs", result, logger_name=logger_name)
        return result

    return wrapper


def json_dumps(dic):
    return json.dumps(dic)


def json_loads(str):
    return json.loads(str)


@pass_context
@log_http_result
def http_get(_, data):
    return requests.get(data["url"]).content.decode()


def get_undeclared_variables(tmpl_code):
    env = Environment()
    ast = env.parse(tmpl_code)
    return meta.find_undeclared_variables(ast)


GLOBAL_FUNCTIONS = {
    "http_get": http_get,
    "psql": psql,
    "json_dumps": json_dumps,
    "json_loads": json_loads,
}


def valid_json(string):
    try:
        json.loads(string)
        return True, ""
    except json.decoder.JSONDecodeError as e:
        return False, str(e)


def parse_template(tmpl_code, template_data, cache_obj_data):
    template_globals = {
        **GLOBAL_FUNCTIONS,
        **{
            "CACHE_UUID": cache_obj_data["uuid"],
            "STORAGE_TYPE": cache_obj_data["storage"],
        },
    }
    rtemplate = Environment(loader=BaseLoader()).from_string(tmpl_code)
    rtemplate.globals.update(template_globals)
    rendered = rtemplate.render(**template_data)
    results = re.sub(r"[\r\n]{2,}", "", rendered.strip())
    results = re.sub(r"\s\s\n", "", results)
    valid, errors = valid_json(results)
    return results, valid, errors


def compile_template(tmpl_code, connector_lookup):
    undeclared_vars = get_undeclared_variables(tmpl_code)
    return {
        var: connector_lookup[var]
        for var in undeclared_vars
        if var not in GLOBAL_FUNCTIONS and var in connector_lookup
    }
