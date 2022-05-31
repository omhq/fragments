import logging
from pathlib import Path


FORMATTER = logging.Formatter("%(asctime)s:: %(message)s")
FORMATTER_CLEAN = logging.Formatter("")
LOGGERS = {}


def file_handler(file_path):
    handler = logging.FileHandler(file_path)
    handler.terminator = "\n\n"
    handler.setFormatter(FORMATTER)
    return handler


def get_logger(logger_name, file_path):
    global LOGGERS

    if logger := LOGGERS.get(logger_name):
        return logger

    logger = logging.getLogger(logger_name)
    logger.setLevel(logging.DEBUG)
    logger.addHandler(file_handler(file_path))
    logger.propagate = False
    LOGGERS[logger_name] = logger
    return logger


def log(cache_uuid, storage_type, file_name, data, logger_name=None):
    if storage_type != 0:
        return

    if not logger_name:
        logger_name = __name__

    directory = f"/home/cache/{cache_uuid}"
    file_path = f"{directory}/{file_name}"

    if not Path(directory).is_dir():
        Path(directory).mkdir(parents=True)

    logger = get_logger(logger_name, file_path)
    logger.info(data)
