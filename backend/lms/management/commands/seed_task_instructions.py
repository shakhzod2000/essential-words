# lms/management/commands/seed_task_instructions.py
from django.core.management.base import BaseCommand
from lms.models import Language, TaskInstruction

class Command(BaseCommand):
    help = 'Seed task instructions in different languages'

    INSTRUCTIONS = {
        'uz': {
            'translate': "Tarjima qiling",
            'fill_blank': "Bo'sh joyni to'ldiring",
            'select_word': "To'g'ri so'zni tanlang",
            'listen_type': "Eshitganingizni yozing",
            'speak': "Aytib bering",
            'match_pairs': "Juftlarni moslang",
            'grammar_correct_form': "To'g'ri shaklni tanlang",
            'grammar_rewrite': "Gapdagi xatoni toping",
            'grammar_find_error': "Gapni qayta yozing",
        },
        'en': {
            'translate': "Translate this",
            'fill_blank': "Fill in the blank",
            'select_word': "Select the correct word",
            'listen_type': "Type what you hear",
            'speak': "Speak this sentence",
            'match_pairs': "Match the pairs",
            'grammar_correct_form': "Choose the correct form",
            'grammar_rewrite': "Find the error",
            'grammar_find_error': "Rewrite the sentence",
        },
        'ru': {
            'translate': "Переведите это",
            'fill_blank': "Заполните пропуск",
            'select_word': "Выберите правильное слово",
            'listen_type': "Напишите то, что слышите",
            'speak': "Произнесите это предложение",
            'match_pairs': "Сопоставьте пары",
            'grammar_correct_form': "Выберите правильную форму",
            'grammar_rewrite': "Найдите ошибку",
            'grammar_find_error': "Перепишите предложение",
        },
    }

    def handle(self, *args, **options):
        self.stdout.write('Seeding task instructions...')

        for lang_code, instructions in self.INSTRUCTIONS.items():
            try:
                language = Language.objects.get(code=lang_code)
            except Language.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'Language {lang_code} not found, skipping'))
                continue

            for question_type, text in instructions.items():
                TaskInstruction.objects.get_or_create(
                    question_type=question_type,
                    language=language,
                    defaults={'instruction_text': text}
                )
                self.stdout.write(f'  ✓ {lang_code} - {question_type}')

        self.stdout.write(self.style.SUCCESS('Task instructions seeded!'))