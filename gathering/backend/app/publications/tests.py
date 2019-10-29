from django.contrib.auth.models import User
from django.urls import reverse
from model_mommy import mommy
from rest_framework import status

from publications.models import Publication, Annotation, Page

PUBLICATIONS_LIST = reverse('publications_list')
PAGES_LIST = reverse('pages_list')
ANNOTATIONS_LIST_CREATE = reverse('annotations_list_create')


def test_filter_with_annotated_by_me(user, user_client):
    publication_1, publication_2 = mommy.make(Publication, _quantity=2)
    mommy.make(Annotation, user=user, page__publication=publication_1)

    response_1 = user_client.get(PUBLICATIONS_LIST, {'annotated_by_me': True})
    assert len(response_1.data['results']) == 1
    assert response_1.data['results'][0]['id'] == publication_1.id

    response_2 = user_client.get(PUBLICATIONS_LIST, {'annotated_by_me': False})
    assert len(response_2.data['results']) == 1
    assert response_2.data['results'][0]['id'] == publication_2.id


def test_filter_with_min_annotators(user_client):
    publications = mommy.make(Publication, _quantity=3)
    for publication in publications:
        mommy.make(Page, publication=publication, _quantity=2)
    users = mommy.make(User, _quantity=2)

    # Publication 1
    mommy.make(Annotation, user=users[0], page=publications[0].page_set.first(), _quantity=2)
    mommy.make(Annotation, user=users[0], page=publications[0].page_set.last())
    mommy.make(Annotation, user=users[1], page=publications[0].page_set.last())

    # Publication 2
    mommy.make(Annotation, user=users[0], page=publications[1].page_set.first())
    mommy.make(Annotation, user=users[1], page=publications[1].page_set.first())
    mommy.make(Annotation, user=users[0], page=publications[1].page_set.last())
    mommy.make(Annotation, user=users[1], page=publications[1].page_set.last())

    response_1 = user_client.get(PUBLICATIONS_LIST, {'min_annotators': 1})
    assert len(response_1.data['results']) == 2
    assert set(p['id'] for p in response_1.data['results']) == {publications[0].id, publications[1].id}

    response_2 = user_client.get(PUBLICATIONS_LIST, {'min_annotators': 2})
    assert len(response_2.data['results']) == 1
    assert response_2.data['results'][0]['id'] == publications[1].id


def test_filter_with_max_annotators(user_client):
    publications = mommy.make(Publication, _quantity=3)
    for publication in publications:
        mommy.make(Page, publication=publication, _quantity=2)
    users = mommy.make(User, _quantity=2)

    # Publication 1
    mommy.make(Annotation, user=users[0], page=publications[0].page_set.first(), _quantity=2)
    mommy.make(Annotation, user=users[0], page=publications[0].page_set.last())

    # Publication 2
    mommy.make(Annotation, user=users[0], page=publications[1].page_set.first())
    mommy.make(Annotation, user=users[1], page=publications[1].page_set.first())
    mommy.make(Annotation, user=users[0], page=publications[1].page_set.last())
    mommy.make(Annotation, user=users[1], page=publications[1].page_set.last())

    response_1 = user_client.get(PUBLICATIONS_LIST, {'max_annotators': 2})
    assert len(response_1.data['results']) == 3
    assert set(p['id'] for p in response_1.data['results']) == {
        publications[0].id, publications[1].id, publications[2].id
    }

    response_2 = user_client.get(PUBLICATIONS_LIST, {'max_annotators': 1})
    assert len(response_2.data['results']) == 2
    assert set(p['id'] for p in response_2.data['results']) == {
        publications[0].id, publications[2].id
    }


def test_annotations_used(user, user_client):
    a1, a2, a3 = mommy.make(Annotation, _quantity=3)
    user.is_superuser = True
    user.save()

    response = user_client.post(ANNOTATIONS_LIST_CREATE, [{
        'page': a1.page_id, 'data': {'{ data: "somedata" }'}, 'annotations_used': [a1.id, a2.id]
    }], format='json')
    assert response.status_code == status.HTTP_201_CREATED
    for a in (a1, a2, a3):
        a.refresh_from_db()
    assert a1.is_used is a2.is_used is True
    assert a3.is_used is False


def test_annotation_tags(user_client):
    publication_1, publication_2 = mommy.make(Publication, _quantity=2)
    mommy.make(Annotation, page__publication=publication_1, visible=True)
    publication_2_page = mommy.make(Page, publication=publication_2)
    post_response = user_client.post(ANNOTATIONS_LIST_CREATE, [{
        'page': publication_2_page.id,
        'data': '{ data: "somedata" }',
        'tags': ['a', 'b']
    }], format='json')
    assert post_response.status_code == status.HTTP_201_CREATED
    assert post_response.data[0]['tags'] == ['a', 'b']

    # publications list
    get_response = user_client.get(PUBLICATIONS_LIST, {'tags': 'a,b'})
    assert len(get_response.data['results']) == 1
    assert get_response.data['results'][0]['id'] == publication_2.id

    # pages list
    get_response = user_client.get(PAGES_LIST, {'tags': 'a,b'})
    assert len(get_response.data['results']) == 1
    assert get_response.data['results'][0]['id'] == publication_2_page.id

    # annotations list
    get_response = user_client.get(ANNOTATIONS_LIST_CREATE, {'tags': 'a,b'})
    assert len(get_response.data['results']) == 1
    assert get_response.data['results'][0]['id'] == post_response.data[0]['id']

def test_annotation_deleted(user_client):
    publication = mommy.make(Publication)
    publication_page = mommy.make(Page, publication=publication)

    #first create
    user_client.post(ANNOTATIONS_LIST_CREATE, [{
        'page': publication_page.id,
        'data': '{ data: "somedata" }',
        'tags': ['a', 'b']
    }], format='json')
    get_response = user_client.get(ANNOTATIONS_LIST_CREATE, {'page_id': publication_page.id})
    assert len(get_response.data['results']) == 1

    #then delete
    user_client.post(ANNOTATIONS_LIST_CREATE, [{
        'page': publication_page.id,
        'data': None,
        'tags': None
    }], format='json')
    get_response = user_client.get(ANNOTATIONS_LIST_CREATE, {'page_id': publication_page.id})
    assert len(get_response.data['results']) == 0

def test_annotation_notDeleted_whenPageNrIsNotCorrect(user_client):
    publication = mommy.make(Publication)
    publication_page = mommy.make(Page, publication=publication, id=1)

    #first create
    user_client.post(ANNOTATIONS_LIST_CREATE, [{
        'page': publication_page.id,
        'data': '{ data: "somedata" }',
        'tags': ['a', 'b']
    }], format='json')
    get_response = user_client.get(ANNOTATIONS_LIST_CREATE, {'page_id': publication_page.id})
    assert len(get_response.data['results']) == 1

    #then delete
    user_client.post(ANNOTATIONS_LIST_CREATE, [{
        'page': 2,
        'data': None,
        'tags': None
    }], format='json')
    get_response = user_client.get(ANNOTATIONS_LIST_CREATE, {'page_id': publication_page.id})
    assert len(get_response.data['results']) == 1

