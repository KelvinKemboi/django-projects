from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

class EmailBackend(ModelBackend):
    def authenticate(self, request, username = ..., password = ..., **kwargs):
        return super().authenticate(request, username, password, **kwargs)