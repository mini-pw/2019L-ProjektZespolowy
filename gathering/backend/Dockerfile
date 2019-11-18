FROM python:buster

WORKDIR /app

RUN apt-get update && apt-get -y install poppler-utils tesseract-ocr libtesseract-dev libleptonica-dev pkg-config

RUN pip install uwsgi

ADD requirements.txt .

RUN pip install -r requirements.txt

ADD app .

CMD "./entrypoint.sh"
