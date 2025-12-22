# core/pipeline.py
import requests
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


def associate_by_email(backend, details, user=None, *args, **kwargs):
    """
    Associate social auth account with existing user by email.
    This prevents duplicate accounts when a user signs up normally and then uses OAuth.
    """
    if user:
        return None

    email = details.get('email')
    if email:
        # Check if a user with this email already exists
        try:
            existing_user = User.objects.get(email=email)
            return {'user': existing_user, 'is_new': False}
        except User.DoesNotExist:
            pass

    return None


def save_profile_picture(backend, user, response, *args, **kwargs):
    """
    Custom pipeline function to save Google OAuth profile picture to S3
    This runs during the OAuth authentication process
    """
    if backend.name == 'google-oauth2':
        picture_url = response.get('picture')

        if picture_url and not user.profile_image:
            try:
                # Download the image from Google
                img_response = requests.get(picture_url, timeout=10)

                if img_response.status_code == 200:
                    # Generate a unique filename
                    file_extension = 'jpg'
                    filename = f'profile_images/{user.id}_{uuid.uuid4()}.{file_extension}'

                    # Save to S3 using Django's default storage
                    file_path = default_storage.save(
                        filename,
                        ContentFile(img_response.content)
                    )

                    # Update user's profile_image field with just the file path
                    # Django storage will generate the full URL when accessed
                    user.profile_image = file_path
                    user.save(update_fields=['profile_image'])

            except Exception as e:
                # Don't fail authentication if image download fails
                print(f"Error saving profile image: {e}")
                pass
