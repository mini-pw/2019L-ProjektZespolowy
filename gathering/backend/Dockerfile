FROM python:3.7

WORKDIR /app

RUN apt-get update && apt-get -y install poppler-utils

RUN pip install uwsgi

ADD requirements.txt .

RUN pip install -r requirements.txt

ADD app .

CMD "./entrypoint.sh"