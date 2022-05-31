FROM python:3.10

WORKDIR /app

RUN apt-get update && \
  apt-get install -y \
  software-properties-common \
  build-essential

RUN apt-get update && \
  apt-get install -y \
  postgresql \
  postgresql-contrib && \
  rm -rf /var/lib/apt/lists/*

COPY ./worker/requirements.txt .
COPY ./utils/utils ./utils

RUN pip install -r requirements.txt

ENTRYPOINT celery -A worker worker --autoscale 10 --loglevel=info
