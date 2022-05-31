import os
from celery import Celery


BROKER_URL = os.environ.get("BROKER_URL")
worker = Celery('worker', broker=BROKER_URL, backend=BROKER_URL)
