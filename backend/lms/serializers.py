# lms/serializers.py
import re
from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import (
    Language, LanguagePair, Book, Unit, Lesson, 
    Vocabulary, VocabularyTranslation, Question, QuestionOption,
    UserLanguagePair, UserLessonProgress, QuestionAttempt,
    GrammarTopic, TaskInstruction
)

User = get_user_model()


class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = ['id', 'name', 'code', 'flag_image']


class LanguagePairSerializer(serializers.ModelSerializer):
    from_lang = LanguageSerializer(read_only=True)
    target_lang = LanguageSerializer(read_only=True)
    
    class Meta:
        model = LanguagePair
        fields = ['id', 'from_lang', 'target_lang', 'is_active']


class BookSerializer(serializers.ModelSerializer):
    language = LanguageSerializer(read_only=True)
    
    class Meta:
        model = Book
        fields = ['id', 'title', 'language', 'description', 'cefr_level', 'created_at']


class VocabularyTranslationSerializer(serializers.ModelSerializer):
    language = LanguageSerializer(read_only=True)
    
    class Meta:
        model = VocabularyTranslation
        fields = ['id', 'language', 'translation', 'example_translation']


class VocabularySerializer(serializers.ModelSerializer):
    translations = VocabularyTranslationSerializer(source='vocabulary_translations', many=True, read_only=True)
    unit_number = serializers.IntegerField(source='unit.number', read_only=True)
    
    class Meta:
        model = Vocabulary
        fields = [
            'id', 'word', 'unit_number', 'word_number', 
            'image', 'audio', 'example_sentence', 'part_of_speech',
            'translations', 'created_at'
        ]


class QuestionOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionOption
        fields = ['id', 'text', 'order']  # Don't expose is_correct


class QuestionSerializer(serializers.ModelSerializer):
    options = QuestionOptionSerializer(many=True, read_only=True)
    vocabulary_word = serializers.CharField(
        source='vocabulary.word', read_only=True, allow_null=True)
    task_instruction = serializers.SerializerMethodField()
    word_translations = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = [
            'id', 'lesson', 'question_type', 'task_instruction', 'order', 'prompt', 'audio', 'image', 'vocabulary', 'vocabulary_word', 'grammar_lesson', 'options', 'correct_answer', 'explanation', 'word_translations'
        ]

    def get_word_translations(self, obj):
        """
        Get translations for all words in the prompt
        Returns: {"hello": {"translation": "salom", "partOfSpeech": "interjection"}, ...}
        """
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return {}

        # Get language pair from the question's unit, NOT potential user's current valid pair
        # This ensures we get translations relevant to the COURSE being studied
        lang_pair = obj.lesson.unit.lang_pair
        from_lang = lang_pair.from_lang

        # Get all words from the prompt (split by spaces and clean)
        # Use \w+ to match Unicode characters and handle apostrophes for contractions like "don't"
        words = re.findall(r"\w+(?:['’]\w+)?", obj.prompt.lower())
        
        translations = {}

        # For each word in prompt, try to find translation
        for word in set(words):  # Use set to avoid duplicates
            # Try to find vocabulary entry
            # We filter by the Unit's Link to ensure we get the definition for THIS course
            vocab = Vocabulary.objects.filter(
                word__iexact=word,
                unit__lang_pair=lang_pair
            ).first()
            
            if vocab:
                # Get translation for this word
                translation = VocabularyTranslation.objects.filter(
                    vocabulary=vocab,
                    language=from_lang
                ).first()
                
                if translation:
                    translations[word] = {
                        'translation': translation.translation,
                        'partOfSpeech': vocab.part_of_speech
                    }

        return translations

    def get_task_instruction(self, obj):
        """Get task instruction in user's native language"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return self._get_default_instruction(obj.question_type)

        # Get user's native language (from_lang) - Use question context if possible?
        # Instructions are for the USER, so using user's prefered language is correct usually.
        # But consistency with translations implies using the unit's from_lang.
        # Let's check if we should align this too.
        # Original code: user_lang_pair = request.user.user_language_pairs.first()
        # If user has multiple pairs, this is buggy.
        # Using obj.lesson.unit.lang_pair.from_lang is safer as it matches the course language.
        
        lang_pair = obj.lesson.unit.lang_pair
        from_lang = lang_pair.from_lang

        try:
            instruction = TaskInstruction.objects.get(
                question_type=obj.question_type,
                language=from_lang
            )
            return instruction.instruction_text
        except TaskInstruction.DoesNotExist:
            return self._get_default_instruction(obj.question_type)

    def _get_default_instruction(self, question_type):
        """Fallback to English"""
        try:
            instruction = TaskInstruction.objects.get(
                question_type=question_type,
                language__code='en'
            )
            return instruction.instruction_text
        except TaskInstruction.DoesNotExist:
            return question_type.replace('_', ' ').title()



class QuestionDetailSerializer(serializers.ModelSerializer):
    """Used after answer submission to show correct answer"""
    options = QuestionOptionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = [
            'id', 'question_type', 'prompt', 'correct_answer', 
            'explanation', 'audio', 'image', 'options'
        ]


class GrammarTopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = GrammarTopic
        fields = ['id', 'title', 'cefr_level', 'order', 'description']


class LessonSerializer(serializers.ModelSerializer):
    grammar_topic = GrammarTopicSerializer(read_only=True)
    questions_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Lesson
        fields = [
            'id', 'unit', 'order', 'title', 'lesson_type',
            'grammar_topic', 'total_stars', 'xp_reward',
            'is_published', 'questions_count'
        ]
    
    def get_questions_count(self, obj):
        return obj.questions.count()


class UnitSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    book_title = serializers.CharField(source='book.title', read_only=True)
    cefr_level = serializers.CharField(source='book.cefr_level', read_only=True)
    
    class Meta:
        model = Unit
        fields = [
            'id', 'book', 'book_title', 'lang_pair', 'number',
            'title', 'description', 'cefr_level', 'is_published',
            'lessons'
        ]


class UserLessonProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    accuracy = serializers.FloatField(read_only=True)
    
    class Meta:
        model = UserLessonProgress
        fields = [
            'id', 'user', 'lesson', 'lesson_title', 'status',
            'stars_earned', 'questions_completed', 'questions_correct',
            'accuracy', 'attempts', 'completed_at', 'updated_at'
        ]
        read_only_fields = ['user', 'updated_at']


class UserLanguagePairSerializer(serializers.ModelSerializer):
    lang_pair = LanguagePairSerializer(read_only=True)
    current_unit = UnitSerializer(source='curr_unit', read_only=True)
    
    class Meta:
        model = UserLanguagePair
        fields = [
            'id', 'user', 'lang_pair', 'cefr_level', 
            'level_progress_percent', 'completed_levels',
            'current_unit', 'total_words_learned', 'total_grammar_topics',
            'total_xp', 'curr_streak', 'longest_streak',
            'last_practice_date', 'created_at'
        ]
        read_only_fields = ['user', 'created_at']


class QuestionAttemptSerializer(serializers.ModelSerializer):
    question_prompt = serializers.CharField(source='question.prompt', read_only=True)
    
    class Meta:
        model = QuestionAttempt
        fields = [
            'id', 'user', 'question', 'question_prompt',
            'user_answer', 'is_correct', 'time_spent_sec',
            'attempted_at', 'next_review_date', 'review_interval_days'
        ]
        read_only_fields = ['user', 'attempted_at']


class UserSerializer(serializers.ModelSerializer):
    language_pairs = UserLanguagePairSerializer(source='user_language_pairs', many=True, read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'language_pairs', 'profile_image']
        read_only_fields = ['id', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, 
        style={'input_type': 'password'}, 
        min_length=8
    )
    password2 = serializers.CharField(
        write_only=True, required=True, 
        style={'input_type': 'password'}, 
        label='Confirm Password'
    )
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': False},
            'last_name': {'required': False}
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
