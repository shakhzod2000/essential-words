# lms/management/commands/seed_a1_structure.py
from django.core.management.base import BaseCommand
from lms.models import Language, LanguagePair, Book, Unit, Lesson, GrammarTopic

class Command(BaseCommand):
    help = 'Seeds A1 structure: languages, books, units, lessons, grammar topics'

    def handle(self, *args, **options):
        self.stdout.write('=== Seeding A1 Structure ===\n')

        # Languages
        uz = Language.objects.get_or_create(code='uz', defaults={'name': 'Uzbek'})[0]
        en = Language.objects.get_or_create(code='en', defaults={'name': 'English'})[0]
        
        # Language Pair
        pair = LanguagePair.objects.get_or_create(
            from_lang=uz, target_lang=en, defaults={'is_active': True}
        )[0]
        
        # Book
        book = Book.objects.get_or_create(
            title='Essential Words 1',
            language=en,
            defaults={'description': 'A1 beginner vocabulary', 'cefr_level': 'A1'}
        )[0]
        
        # Grammar Topics
        grammar_topics = [
            "Present Simple - be (am/is/are)",
            "Personal Pronouns",
            "Possessive Adjectives",
            "Present Simple - regular verbs",
            "Question Words",
            "Articles (a/an/the)",
            "Plural Nouns",
            "Demonstratives (this/that)",
            "Present Continuous",
            "Prepositions of Place",
        ]
        
        for idx, title in enumerate(grammar_topics, 1):
            GrammarTopic.objects.get_or_create(
                language=en,
                cefr_level='A1',
                order=idx,
                defaults={
                    'title': title,
                    'description': f'A1 Grammar: {title}'
                }
            )
        
        # 10 Units with themes
        units_data = [
            "Greetings & Introductions",
            "Numbers & Time",
            "Family & Relationships",
            "Daily Routines",
            "Food & Drinks",
            "Colors & Objects",
            "Body & Health",
            "Clothes & Shopping",
            "Weather & Seasons",
            "Places & Directions",
        ]
        
        for num, theme in enumerate(units_data, 1):
            unit, created = Unit.objects.get_or_create(
                book=book,
                lang_pair=pair,
                number=num,
                defaults={
                    'title': theme,
                    'description': f'Learn 20 essential words about {theme.lower()}',
                    'is_published': True
                }
            )
            
            if created:
                # 6 lessons per unit
                grammar_topic = GrammarTopic.objects.get(
                    language=en, cefr_level='A1', order=num
                )
                
                lessons = [
                    {'order': 1, 'title': 'Words 1-5', 'type': 'vocabulary', 'stars': 5},
                    {'order': 2, 'title': 'Words 6-10', 'type': 'vocabulary', 'stars': 5},
                    {'order': 3, 'title': 'Words 11-15', 'type': 'vocabulary', 'stars': 5},
                    {'order': 4, 'title': 'Words 16-20', 'type': 'vocabulary', 'stars': 5},
                    {'order': 5, 'title': f'Grammar: {grammar_topic.title}', 'type': 'grammar', 'stars': 5, 'grammar': grammar_topic},
                    {'order': 6, 'title': 'Unit Review', 'type': 'review', 'stars': 5},
                ]
                
                for les in lessons:
                    Lesson.objects.create(
                        unit=unit,
                        order=les['order'],
                        title=les['title'],
                        lesson_type=les['type'],
                        grammar_topic=les.get('grammar'),
                        total_stars=les['stars'],
                        xp_reward=15 if les['type'] == 'review' else 10,
                        is_published=True
                    )
                
                self.stdout.write(f"✓ Unit {num}: {theme}")
        
        self.stdout.write(self.style.SUCCESS('\n✅ A1 Structure Complete!'))