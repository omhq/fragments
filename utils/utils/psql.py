import uuid
from functools import wraps
from .connectors.psql.main import ConnPsql
from jinja2 import pass_context
from .log import log


def log_postgresql_result(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        ctx = args[0]
        query = args[2]
        cache_uuid = ctx["CACHE_UUID"]
        storage_type = ctx["STORAGE_TYPE"]
        logger_name = f"http-{str(uuid.uuid4())[:8]}"
        result = fn(*args, **kwargs)

        log(cache_uuid, storage_type, "logs", query, logger_name=logger_name)
        log(cache_uuid, storage_type, "logs", result, logger_name=logger_name)
        return result

    return wrapper


@pass_context
@log_postgresql_result
def psql(_, connect_config, query):
    with ConnPsql(connect_config) as db:
        return db.query(query)
