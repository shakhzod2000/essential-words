from storages.backends.s3 import S3Storage
from django.conf import settings


class MediaStorage(S3Storage):
    # bucket_name = settings.AWS_STORAGE_BUCKET_NAME
    location = 'media'
    file_overwrite = False


class StaticStorage(S3Storage):
    # bucket_name = settings.AWS_STORAGE_BUCKET_NAME
    location = 'static'
    file_overwrite = True
