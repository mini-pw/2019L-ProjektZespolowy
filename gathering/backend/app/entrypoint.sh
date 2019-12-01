#!/usr/bin/env bash

sleep 10; # wait for database
python3 manage.py migrate
python3 manage.py collectstatic
python3 manage.py runserver 0.0.0.0:8000
