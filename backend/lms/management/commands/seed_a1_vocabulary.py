# lms/management/commands/seed_a1_vocabulary.py
from django.core.management.base import BaseCommand
from lms.models import Unit, Vocabulary, VocabularyTranslation, Language

class Command(BaseCommand):
    help = 'Seeds A1 vocabulary with Uzbek translations'

    UNIT_1 = [  # Greetings & Introductions
        {'word': 'hello', 'uz': 'salom', 'example': 'Hello! How are you?', 'pos': 'interjection'},
        {'word': 'goodbye', 'uz': 'xayr', 'example': 'Goodbye! See you later.', 'pos': 'interjection'},
        {'word': 'please', 'uz': 'iltimos', 'example': 'Please help me.', 'pos': 'adverb'},
        {'word': 'thank you', 'uz': 'rahmat', 'example': 'Thank you very much!', 'pos': 'interjection'},
        {'word': 'yes', 'uz': 'ha', 'example': 'Yes, I agree.', 'pos': 'adverb'},
        {'word': 'no', 'uz': "yo'q", 'example': 'No, I do not.', 'pos': 'adverb'},
        {'word': 'sorry', 'uz': 'kechirasiz', 'example': 'Sorry, I am late.', 'pos': 'interjection'},
        {'word': 'excuse me', 'uz': 'uzr', 'example': 'Excuse me, where is...?', 'pos': 'interjection'},
        {'word': 'name', 'uz': 'ism', 'example': 'My name is John.', 'pos': 'noun'},
        {'word': 'I', 'uz': 'men', 'example': 'I am a student.', 'pos': 'pronoun'},
        {'word': 'you', 'uz': 'siz', 'example': 'You are kind.', 'pos': 'pronoun'},
        {'word': 'am', 'uz': 'man', 'example': 'I am happy.', 'pos': 'verb'},
        {'word': 'is', 'uz': '', 'example': 'He is tall.', 'pos': 'verb'},
        {'word': 'are', 'uz': '', 'example': 'They are friends.', 'pos': 'verb'},
        {'word': 'good', 'uz': 'yaxshi', 'example': 'Good morning!', 'pos': 'adjective'},
        {'word': 'morning', 'uz': 'ertalab', 'example': 'I wake up in the morning.', 'pos': 'noun'},
        {'word': 'afternoon', 'uz': 'tushdan keyin', 'example': 'Good afternoon!', 'pos': 'noun'},
        {'word': 'evening', 'uz': 'kechqurun', 'example': 'Good evening!', 'pos': 'noun'},
        {'word': 'night', 'uz': 'kecha', 'example': 'Good night!', 'pos': 'noun'},
        {'word': 'welcome', 'uz': 'xush kelibsiz', 'example': 'You are welcome!', 'pos': 'adjective'},
    ]

    def handle(self, *args, **options):
        self.stdout.write('=== Seeding A1 Vocabulary ===\n')

        uz = Language.objects.get(code='uz')
        en = Language.objects.get(code='en')
        
        # Unit 1
        unit1 = Unit.objects.get(book__title='Essential Words 1', number=1)
        
        for idx, word_data in enumerate(self.UNIT_1, 1):
            vocab, created = Vocabulary.objects.get_or_create(
                unit=unit1,
                word_number=idx,
                defaults={
                    'word': word_data['word'],
                    'example_sentence': word_data['example'],
                    'part_of_speech': word_data['pos']
                }
            )
            
            if created:
                VocabularyTranslation.objects.create(
                    vocabulary=vocab,
                    language=uz,
                    translation=word_data['uz'],
                    example_translation=f"Misol: {word_data['example']}"
                )
                self.stdout.write(f"  {idx}. {vocab.word} → {word_data['uz']}")
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Unit 1: {len(self.UNIT_1)} words added'))
        self.stdout.write('\nNext: Add Units 2-10, then create questions')