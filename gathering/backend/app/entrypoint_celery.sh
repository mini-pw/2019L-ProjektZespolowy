#!/usr/bin/env bash

sleep 10; # wait for database
celery -A config worker --loglevel=info
