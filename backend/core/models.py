# core/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom User model with additional fields"""
    bio = models.TextField(blank=True, max_length=500)
    profile_image = models.ImageField(
        upload_to='profile_images/', blank=True, null=True)
    birth_date = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'auth_user'

    def __str__(self):
        return self.username