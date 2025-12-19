# Generated manually - adds custom fields to existing auth_user table
from django.db import migrations


def add_custom_user_fields(apps, schema_editor):
    """Add custom fields to auth_user table if they don't exist"""
    with schema_editor.connection.cursor() as cursor:
        # Check and add bio field
        cursor.execute("""
            SELECT COUNT(*)
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'auth_user'
            AND COLUMN_NAME = 'bio'
        """)
        if cursor.fetchone()[0] == 0:
            cursor.execute("ALTER TABLE auth_user ADD COLUMN bio TEXT NOT NULL DEFAULT ''")

        # Check and add profile_image field
        cursor.execute("""
            SELECT COUNT(*)
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'auth_user'
            AND COLUMN_NAME = 'profile_image'
        """)
        if cursor.fetchone()[0] == 0:
            cursor.execute("ALTER TABLE auth_user ADD COLUMN profile_image VARCHAR(100) NULL")

        # Check and add date_of_birth field
        cursor.execute("""
            SELECT COUNT(*)
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'auth_user'
            AND COLUMN_NAME = 'date_of_birth'
        """)
        if cursor.fetchone()[0] == 0:
            cursor.execute("ALTER TABLE auth_user ADD COLUMN date_of_birth DATE NULL")


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.RunPython(add_custom_user_fields, migrations.RunPython.noop),
    ]
