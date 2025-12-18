"""
Data Migration Script
Transfers data from old table structure to new optimized structure.

Old structure:
- quizzes (id, title, book)  -> represents books (E1, E2, E3, E4)
- questions (id, quiz_id, numb, question, answer, unit, language)
- options (id, question_id, option_text)

New structure:
- lms_language (id, name, code)
- lms_book (id, title, language_id, description)
- lms_question (id, book_id, unit, order, text, correct_answer, explanation)
- lms_option (id, question_id, text, order)
"""

import os
import django
import sys

# Setup Django environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection
from lms.models import Language, Book, Question, Option


def check_old_tables_exist():
    """Check if old tables exist in database"""
    with connection.cursor() as cursor:
        cursor.execute("SHOW TABLES LIKE 'quizzes'")
        return cursor.fetchone() is not None


def migrate_data():
    """Main migration function"""
    print("Starting data migration...")
    print("=" * 60)

    if not check_old_tables_exist():
        print("❌ Old tables not found. Nothing to migrate.")
        print("If this is a fresh database, you can skip this migration.")
        return

    print("✓ Old tables found. Starting migration...\n")

    with connection.cursor() as cursor:
        # Step 1: Get unique languages from old questions table
        print("Step 1: Migrating languages...")
        cursor.execute("SELECT DISTINCT language FROM questions WHERE language IS NOT NULL AND language != ''")
        old_languages = cursor.fetchall()

        language_map = {}
        for (lang_name,) in old_languages:
            # Create language code from name
            lang_code = lang_name.lower()[:10]
            language, created = Language.objects.get_or_create(
                code=lang_code,
                defaults={'name': lang_name}
            )
            language_map[lang_name] = language
            print(f"  {'✓ Created' if created else '  Found'}: {lang_name} ({lang_code})")

        print(f"✓ Migrated {len(language_map)} languages\n")

        # Step 2: Migrate books from old quizzes table
        print("Step 2: Migrating books...")
        cursor.execute("SELECT DISTINCT book FROM quizzes WHERE book IS NOT NULL AND book != ''")
        old_books = cursor.fetchall()

        book_language_map = {}  # Maps (book_name, language_name) -> Book object

        for (book_name,) in old_books:
            # Get languages for this book
            cursor.execute("""
                SELECT DISTINCT q.language
                FROM questions q
                JOIN quizzes qz ON q.quiz_id = qz.id
                WHERE qz.book = %s AND q.language IS NOT NULL
            """, [book_name])

            languages_for_book = cursor.fetchall()

            for (lang_name,) in languages_for_book:
                if lang_name in language_map:
                    # Create book for each language
                    book, created = Book.objects.get_or_create(
                        title=book_name,
                        language=language_map[lang_name],
                        defaults={'description': f'{book_name} - {lang_name}'}
                    )
                    book_language_map[(book_name, lang_name)] = book
                    print(f"  {'✓ Created' if created else '  Found'}: {book_name} ({lang_name})")

        print(f"✓ Migrated {len(book_language_map)} book-language combinations\n")

        # Step 3: Migrate questions
        print("Step 3: Migrating questions...")
        cursor.execute("""
            SELECT q.id, qz.book, q.language, q.unit, q.numb, q.question, q.answer
            FROM questions q
            JOIN quizzes qz ON q.quiz_id = qz.id
            WHERE q.language IS NOT NULL AND qz.book IS NOT NULL
            ORDER BY qz.book, q.language, q.unit, q.numb
        """)

        old_questions = cursor.fetchall()
        question_map = {}  # Maps old question ID to new Question object
        question_count = 0

        for q_id, book_name, lang_name, unit, order, text, answer in old_questions:
            key = (book_name, lang_name)
            if key in book_language_map:
                book = book_language_map[key]

                # Create question
                question, created = Question.objects.get_or_create(
                    book=book,
                    unit=unit,
                    order=order,
                    defaults={
                        'text': text,
                        'correct_answer': answer,
                        'explanation': ''
                    }
                )
                question_map[q_id] = question
                question_count += 1

                if question_count % 100 == 0:
                    print(f"  Processed {question_count} questions...")

        print(f"✓ Migrated {question_count} questions\n")

        # Step 4: Migrate options
        print("Step 4: Migrating options...")
        cursor.execute("""
            SELECT o.id, o.question_id, o.option_text
            FROM options o
            WHERE o.question_id IN (SELECT id FROM questions)
            ORDER BY o.question_id, o.id
        """)

        old_options = cursor.fetchall()

        # Group options by question
        options_by_question = {}
        for opt_id, q_id, text in old_options:
            if q_id not in options_by_question:
                options_by_question[q_id] = []
            options_by_question[q_id].append(text)

        option_count = 0
        for old_q_id, option_texts in options_by_question.items():
            if old_q_id in question_map:
                question = question_map[old_q_id]

                for order, text in enumerate(option_texts, start=1):
                    Option.objects.get_or_create(
                        question=question,
                        order=order,
                        defaults={'text': text}
                    )
                    option_count += 1

        print(f"✓ Migrated {option_count} options\n")

        print("=" * 60)
        print("✅ Migration completed successfully!")
        print("=" * 60)
        print("\nSummary:")
        print(f"  Languages: {Language.objects.count()}")
        print(f"  Books: {Book.objects.count()}")
        print(f"  Questions: {Question.objects.count()}")
        print(f"  Options: {Option.objects.count()}")

        # Show breakdown by book
        print("\nBreakdown by book:")
        for book in Book.objects.all():
            q_count = Question.objects.filter(book=book).count()
            units = Question.objects.filter(book=book).values_list('unit', flat=True).distinct().count()
            print(f"  {book.title} ({book.language.name}): {q_count} questions across {units} units")

        print("\n" + "=" * 60)
        print("Next steps:")
        print("1. Verify the data in Django admin at http://localhost:8000/admin/")
        print("2. If everything looks good, you can drop the old tables:")
        print("   DROP TABLE options;")
        print("   DROP TABLE questions;")
        print("   DROP TABLE quizzes;")
        print("=" * 60)


if __name__ == '__main__':
    try:
        migrate_data()
    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
