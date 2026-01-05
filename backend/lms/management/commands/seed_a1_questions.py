from django.core.management.base import BaseCommand
from lms.models import Lesson, Question, QuestionOption, Vocabulary
import random
import re

class Command(BaseCommand):
    help = 'Seeds varied question types for A1'

    def handle(self, *args, **options):
        try:
            lesson = Lesson.objects.get(
                unit__book__title='Essential Words 1',
                unit__number=1,
                order=1
            )
        except Lesson.DoesNotExist:
            self.stdout.write(self.style.ERROR('Lesson 1 not found. Please run valid seed_lessons first.'))
            return

        words = list(Vocabulary.objects.filter(
            unit=lesson.unit,
            word_number__lte=10 
        ))
        
        all_words = list(Vocabulary.objects.filter(
            unit=lesson.unit
        ))
        
        questions_data = []

        for vocab in words:
            translation = vocab.vocabulary_translations.first()
            if not translation:
                continue

            # --- Helper for capitalization ---
            def capitalize_sentence(text):
                if not text: return text
                return text[0].upper() + text[1:]

            # --- Helper for cleaning options ---
            def clean_option(text):
                # Remove "Misol:" prefix if present (common in data)
                cleaned = re.sub(r'^(Misol:|Example:)\s*', '', text, flags=re.IGNORECASE)
                return capitalize_sentence(cleaned.strip())

            # --- Type 1: Translate ---
            use_sentence = bool(vocab.example_sentence and translation.example_translation)
            
            if use_sentence:
                prompt_text = vocab.example_sentence
                # Clean the answer
                correct_answer_text = clean_option(translation.example_translation)
                
                # Get wrong options (sentences) from NATIVE language (example_translation)
                wrong_opts = []
                potential_wrongs = [w for w in all_words if w.id != vocab.id]
                random.shuffle(potential_wrongs)
                
                for w in potential_wrongs:
                    wt = w.vocabulary_translations.first()
                    if wt and wt.example_translation:
                        wrong_opts.append(clean_option(wt.example_translation))
                    if len(wrong_opts) >= 3:
                        break
                        
                while len(wrong_opts) < 3:
                     wrong_opts.append("Wrong Sentence Option")
            else:
                prompt_text = vocab.word
                correct_answer_text = clean_option(translation.translation)
                
                # Get wrong options (words) from NATIVE language
                wrong_opts = []
                potential_wrongs = [w for w in all_words if w.id != vocab.id]
                random.shuffle(potential_wrongs)
                
                for w in potential_wrongs:
                    wt = w.vocabulary_translations.first()
                    if wt and wt.translation:
                        wrong_opts.append(clean_option(wt.translation))
                    if len(wrong_opts) >= 3:
                        break
                
                while len(wrong_opts) < 3:
                    wrong_opts.append("Wrong Word")

            questions_data.append({
                'type': 'translate',
                'vocab': vocab,
                'prompt': prompt_text,
                'correct_answer': correct_answer_text,
                'explanation': f"Correct translation: {correct_answer_text}",
                'options': [correct_answer_text] + wrong_opts
            })

            # --- Type 2: Fill blank ---
            base_sentence = vocab.example_sentence if vocab.example_sentence else f"I like {vocab.word}."
            sentence_with_blank = re.sub(re.escape(vocab.word), '_____', base_sentence, flags=re.IGNORECASE)
            
            if '_____' not in sentence_with_blank:
               sentence_with_blank = f"_____ is the word." 

            questions_data.append({
                'type': 'fill_blank',
                'vocab': vocab,
                'prompt': sentence_with_blank,
                'correct_answer': vocab.word.lower(), # Answer is the missing word (Target Lang)
                'explanation': f"The missing word is '{vocab.word}'",
                'options': [] 
            })
            
            # --- Type 3: Listen and Type ---
            questions_data.append({
                'type': 'listen_type',
                'vocab': vocab,
                'prompt': " ", 
                'correct_answer': vocab.word.lower(),
                'explanation': f"You heard: '{vocab.word}'",
                'audio': vocab.audio.name if vocab.audio else f"vocabulary/audio/{vocab.word}.mp3",
                'options': []
            })
        
        # Shuffle questions to mix types
        random.shuffle(questions_data)
        
        # Update Questions preserving IDs by using 'order' as key
        # User Concern: "don't delete records... now they start from id=60"
        # Since 'order' is unique per lesson, update_or_create on (lesson, order) keeps stable set of rows.
        # IDs will persist unless we intentionally delete() Question objects.
        
        for i, q_data in enumerate(questions_data):
            order = i + 1
            
            defaults = {
                'vocabulary': q_data['vocab'],
                'question_type': q_data['type'],
                'prompt': q_data['prompt'],
                'correct_answer': q_data['correct_answer'],
                'explanation': q_data['explanation'],
            }
            if 'audio' in q_data:
                defaults['audio'] = q_data['audio']
            
            q_obj, _ = Question.objects.update_or_create(
                lesson=lesson,
                order=order,
                defaults=defaults
            )
            
            # Options: Must recreate because content changes completely
            q_obj.options.all().delete()
            
            if q_data['options']:
                opts_text = q_data['options']
                correct_text = opts_text[0] # First one was correct
                random.shuffle(opts_text)
                
                db_opts = []
                for idx, txt in enumerate(opts_text):
                    db_opts.append(QuestionOption(
                        question=q_obj,
                        text=txt,
                        is_correct=(txt == correct_text),
                        order=idx + 1
                    ))
                QuestionOption.objects.bulk_create(db_opts)

        self.stdout.write(self.style.SUCCESS(f'✅ Seeded {len(questions_data)} questions (IDs preserved via update)'))