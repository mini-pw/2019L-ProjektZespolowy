from django.contrib.auth.models import User
from rest_framework import serializers

from publications.models import Annotation


class UserSerializer(serializers.ModelSerializer):
    is_annotator = serializers.BooleanField(source='is_staff', read_only=True)
    is_superannotator = serializers.BooleanField(source='is_superuser', read_only=True)

    def create(self, validated_data):
        validated_data['is_staff'] = True
        user = User.objects.create_user(
            **validated_data
        )
        return user

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 'is_annotator', 'is_superannotator')
        extra_kwargs = {
            'password': {'write_only': True},
            'first_name': {'required': True},
            'last_name': {'required': True}
        }


class DetailedUserSerializer(UserSerializer):
    annotations_count = serializers.SerializerMethodField()
    used_annotations_count = serializers.SerializerMethodField()

    def get_annotations_count(self, user):
        return Annotation.objects.filter(user=user).count()

    def get_used_annotations_count(self, user):
        return Annotation.objects.filter(user=user, is_used=True).count()

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ('annotations_count', 'used_annotations_count')
