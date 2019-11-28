import pytest
from django.contrib.auth.models import User
from model_bakery import baker
from rest_framework.test import APIClient


@pytest.fixture(autouse=True)
def enable_db_access_for_all_tests(db):
    pass


@pytest.fixture
def client():
    return APIClient()


new_client = client


@pytest.fixture
def user():
    user = baker.make(User, is_active=True, is_staff=True, _fill_optional=True)
    return user


@pytest.fixture
def user_client(user, client):
    client.force_login(user)
    return client
