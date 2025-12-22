# core/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model

User = get_user_model()


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User admin"""
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('bio', 'profile_image', 'birth_date')
        }),
    )
    readonly_fields = ['date_joined']
    list_display = [
        'username', 'email', 'first_name', 'last_name', 'is_staff', 'date_joined']
    