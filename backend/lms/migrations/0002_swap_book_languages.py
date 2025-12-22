# Generated migration to swap book language references

from django.db import migrations


def swap_book_languages(apps, schema_editor):
    """
    Swap the language_id for books to match the new Language IDs.
    Before: English was id=2, German was id=1
    After: English is id=1, German is id=2

    So we need to swap all books' language_id from 1→2 and 2→1
    """
    # Use raw SQL to disable foreign key checks temporarily
    with schema_editor.connection.cursor() as cursor:
        # Disable foreign key checks
        cursor.execute("SET FOREIGN_KEY_CHECKS=0;")

        # Step 1: Move language_id=1 books to temporary ID 999
        cursor.execute("UPDATE lms_book SET language_id = 999 WHERE language_id = 1;")

        # Step 2: Move language_id=2 books to ID 1
        cursor.execute("UPDATE lms_book SET language_id = 1 WHERE language_id = 2;")

        # Step 3: Move temporary ID 999 books to ID 2
        cursor.execute("UPDATE lms_book SET language_id = 2 WHERE language_id = 999;")

        # Re-enable foreign key checks
        cursor.execute("SET FOREIGN_KEY_CHECKS=1;")


def reverse_swap_book_languages(apps, schema_editor):
    """Reverse the swap if needed"""
    # Use raw SQL to disable foreign key checks temporarily
    with schema_editor.connection.cursor() as cursor:
        cursor.execute("SET FOREIGN_KEY_CHECKS=0;")
        cursor.execute("UPDATE lms_book SET language_id = 999 WHERE language_id = 1;")
        cursor.execute("UPDATE lms_book SET language_id = 1 WHERE language_id = 2;")
        cursor.execute("UPDATE lms_book SET language_id = 2 WHERE language_id = 999;")
        cursor.execute("SET FOREIGN_KEY_CHECKS=1;")


class Migration(migrations.Migration):

    dependencies = [
        ('lms', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(swap_book_languages, reverse_swap_book_languages),
    ]
