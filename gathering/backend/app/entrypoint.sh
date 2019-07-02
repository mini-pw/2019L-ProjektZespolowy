#!/usr/bin/env bash

sleep 10; # wait for database
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
