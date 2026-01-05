# lms/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class Language(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, unique=True)
    flag_image = models.ImageField(upload_to='flags/')

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name



class Book(models.Model):
    title = models.CharField(max_length=255)
    language = models.ForeignKey(
        Language, on_delete=models.CASCADE,  related_name='books')
    description = models.TextField(blank=True)

    cefr_level = models.CharField(
        max_length=2,
        choices=[
            ('A1', 'A1'), ('A2', 'A2'),
            ('B1', 'B1'), ('B2', 'B2'),
            ('C1', 'C1'), ('C2', 'C2'),
        ],
        help_text="CEFR level this book covers"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['language', 'title']
        unique_together = ['title', 'language']

    def __str__(self):
        return f"{self.title} ({self.language.name})"



class LanguagePair(models.Model):
    '''Available language combinations'''
    from_lang = models.ForeignKey(
        Language, on_delete=models.CASCADE, related_name='lang_pairs_from')
    target_lang = models.ForeignKey(
        Language, on_delete=models.CASCADE, related_name='lang_pairs_target')
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['from_lang', 'target_lang']

    def __str__(self):
        return f"{self.from_lang.code} → {self.target_lang.code}"
    


class Unit(models.Model):
    book = models.ForeignKey(
        Book, on_delete=models.CASCADE, related_name='units')
    lang_pair = models.ForeignKey(
        LanguagePair, on_delete=models.CASCADE, related_name='units')
    number = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text="Unit number 1-30")
    title = models.CharField(max_length=200)
    description = models.TextField()
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['number']
        unique_together = ['book', 'lang_pair', 'number']

    def __str__(self):

        return f"{self.book.title} - Unit {self.number}"



class GrammarTopic(models.Model):
    """Grammar topics for ANY target language"""
    language = models.ForeignKey(
        Language, 
        on_delete=models.CASCADE, 
        related_name='grammar_topics',
        help_text="Target language (English, German, etc.)"
    )
    title = models.CharField(max_length=200)
    cefr_level = models.CharField(
        max_length=2,
        choices=[
            ('A1', 'A1'), ('A2', 'A2'),
            ('B1', 'B1'), ('B2', 'B2'),
            ('C1', 'C1'), ('C2', 'C2'),
        ]
    )
    order = models.IntegerField()
    description = models.TextField()
    
    class Meta:
        ordering = ['language', 'cefr_level', 'order']
        unique_together = ['language', 'cefr_level', 'order']
        indexes = [
            models.Index(fields=['language', 'cefr_level', 'order']),
        ]
    
    def __str__(self):
        return f"{self.language.code.upper()} - {self.cefr_level} - {self.title}"



class GrammarLesson(models.Model):
    """Grammar explanations - language-specific"""
    topic = models.ForeignKey(
        GrammarTopic, on_delete=models.CASCADE, related_name='grammar_lessons'
    )
    unit = models.ForeignKey(
        Unit, on_delete=models.CASCADE, related_name='grammar_lessons',
        null=True, blank=True
    )
    title = models.CharField(max_length=200)
    
    # Multi-language explanation
    explanation = models.TextField(
        help_text="Grammar rule explanation in user's native language"
    )
    explanation_lang = models.ForeignKey(
        Language,
        on_delete=models.SET_NULL,
        null=True,
        related_name='grammar_lessons',
        help_text="Language of explanation (usually user's native language)"
    )
    
    examples = models.JSONField(
        default=list,
        help_text='[{"target": "I am learning", "native": "Men o\'rganyapman"}]'
    )
    order = models.IntegerField()
    
    class Meta:
        ordering = ['topic', 'order']
    
    def __str__(self):
        return f"{self.topic.language.code} - {self.title}"



class Lesson(models.Model):
    unit = models.ForeignKey(
        Unit, on_delete=models.CASCADE, related_name='lessons')
    order = models.IntegerField()
    title = models.CharField(max_length=200)

    lesson_type = models.CharField(
        max_length=20,
        choices=[
            ('vocabulary', 'Vocabulary'),
            ('grammar', 'Grammar'),
            ('practice', 'Practice'),
            ('story', 'Story'),    
            ('review', 'Unit Review'),
        ],
        default='vocabulary'
    )

    # Link to grammar topic if grammar lesson
    grammar_topic = models.ForeignKey(
        GrammarTopic, on_delete=models.SET_NULL, 
        null=True, blank=True
    )

    total_stars = models.IntegerField(default=5)
    xp_reward = models.IntegerField(default=10)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']
        unique_together = ['unit', 'order']

    def __str__(self):
        return f"{self.unit} - {self.title}"



class Vocabulary(models.Model):
    """Individual vocabulary words from Essential Words books"""
    word = models.CharField(max_length=200)
    unit = models.ForeignKey(
        Unit, on_delete=models.CASCADE, related_name='vocabularies')
    word_number = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(20)],
        help_text="Word position in unit (1-20)"
    )
    
    audio = models.FileField(
        upload_to='vocabulary/audio/', 
        null=True, blank=True,
        help_text="Pronunciation audio"
    )
    image = models.ImageField(
        upload_to='vocabulary/images/', null=True, blank=True)
    example_sentence = models.TextField(blank=True)
    part_of_speech = models.CharField(
        max_length=20,
        choices=[
            ('noun', 'Noun'),
            ('pronoun', 'Pronoun'),
            ('verb', 'Verb'),
            ('adjective', 'Adjective'),
            ('adverb', 'Adverb'),
            ('preposition', 'Preposition'),
            ('conjunction', 'Conjunction'),
            ('interjection', 'Interjection'),
            ('other', 'Other'),
        ]
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['unit', 'word_number']
        unique_together = ['unit', 'word_number']

    def __str__(self):
        return f"{self.word} - ({self.unit})"



class VocabularyTranslation(models.Model):
    """Translations of vocabulary in different languages"""
    vocabulary = models.ForeignKey(
        Vocabulary, on_delete=models.CASCADE, related_name='vocabulary_translations'
    )
    language = models.ForeignKey(
        Language, on_delete=models.CASCADE, related_name='vocabulary_translations',
        help_text="Language of this translation"
    )
    translation = models.CharField(max_length=200)
    example_translation = models.TextField(
        blank=True,
        help_text="Translated example sentence"
    )
    
    class Meta:
        unique_together = ['vocabulary', 'language']
    
    def __str__(self):
        return f"{self.vocabulary.word} → {self.translation} ({self.language.code})"
    


class TaskInstruction(models.Model):
    """Localized task instructions for different question types"""
    question_type = models.CharField(
        max_length=30,
        choices=[
            ('translate', 'Translate'),
            ('fill_blank', 'Fill in the blank'),
            ('select_word', 'Select word'),
            ('listen_type', 'Listen and type'),
            ('speak', 'Speak'),
            ('match_pairs', 'Match pairs'),
            ('grammar_correct_form', 'Choose correct form'),
            ('grammar_rewrite', 'Rewrite sentence'),
            ('grammar_find_error', 'Find error'),
        ]
    )
    language = models.ForeignKey(
        Language, 
        on_delete=models.CASCADE,
        related_name='task_instructions'
    )
    instruction_text = models.CharField(max_length=200)
    
    class Meta:
        unique_together = ['question_type', 'language']
    
    def __str__(self):
        return f"{self.language.code} - {self.question_type}: {self.instruction_text}"



class Question(models.Model):
    """Questions for learning (Duolingo-style varied types)"""
    QUESTION_TYPES = [
        ('translate', 'Translate this sentence'),
        ('fill_blank', 'Fill in the blank'),
        ('listen_type', 'Type what you hear'),
        ('speak', 'Speak this sentence'),
        ('match_pairs', 'Match pairs'),
        ('select_word', 'Select the correct word'),

        # Grammar types
        ('grammar_correct_form', 'Choose correct form'),
        ('grammar_rewrite', 'Rewrite sentence'),
        ('grammar_find_error', 'Find the error'),
    ]

    vocabulary = models.ForeignKey(
        Vocabulary, 
        on_delete=models.SET_NULL, 
        null=True, blank=True,
        help_text="Vocabulary word being tested"
    )
    grammar_lesson = models.ForeignKey(
        GrammarLesson,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        help_text="Grammar lesson being tested"
    )
    
    lesson = models.ForeignKey(
        Lesson, on_delete=models.CASCADE, related_name='questions')
    question_type = models.CharField(
        max_length=50, choices=QUESTION_TYPES)
    order = models.IntegerField(
        validators=[MinValueValidator(1)])

    prompt = models.TextField(
        help_text="Question text or prompt")
    correct_answer = models.TextField(
        help_text="Correct answer")
    explanation = models.TextField(blank=True)

    audio = models.FileField(
        upload_to='audios/', null=True, blank=True)
    image = models.ImageField(
        upload_to='images/', null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['lesson', 'order']
        unique_together = ['lesson', 'order']

    def __str__(self):
        return f"{self.lesson} - Q{self.order}: {self.prompt[:50]}"



class QuestionOption(models.Model):
    """Multiple choice options for questions"""
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)
    order = models.IntegerField(
        validators=[MinValueValidator(1)])

    class Meta:
        ordering = ['question', 'order']
        unique_together = ['question', 'order']

    def __str__(self):
        return f"{self.question.id} - {self.text}"



class UserLanguagePair(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='user_language_pairs')
    lang_pair = models.ForeignKey(
        LanguagePair, on_delete=models.CASCADE, related_name='user_language_pairs')
    cefr_level = models.CharField(
        max_length=20,
        choices=[
            ('A1', 'Beginner'),
            ('A2', 'Elementary'),
            ('B1', 'Intermediate'),
            ('B2', 'Upper-Intermediate'),
            ('C1', 'Advanced'),
            ('C2', 'Proficiency')
        ],
        default='A1'
    )
    # Progress within current level
    level_progress_percent = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Progress % within current CEFR level"
    )
    completed_levels = models.JSONField(
        default=list,
        help_text='["A1", "A2"] - list of completed CEFR levels'
    )
    assessment_score = models.IntegerField(
        null=True, blank=True)
    curr_unit = models.ForeignKey(
        Unit, on_delete=models.SET_NULL, null=True, blank=True)
    # Stats
    total_words_learned = models.IntegerField(default=0)
    total_grammar_topics = models.IntegerField(default=0)
    total_xp = models.IntegerField(default=0)
    curr_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_practice_date = models.DateField(
        null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'lang_pair']

    def __str__(self):
        return f"{self.user.username}: {self.lang_pair}"
    
    def advance_level(self):
        """Move to next CEFR level when current one completed"""
        levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
        current_idx = levels.index(self.cefr_level)
        
        if current_idx < len(levels) - 1:
            if self.cefr_level not in self.completed_levels:
                self.completed_levels.append(self.cefr_level)
            self.cefr_level = levels[current_idx + 1]
            self.level_progress_percent = 0
            self.save()



class UserLessonProgress(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='user_lesson_progress')
    lesson = models.ForeignKey(
        Lesson, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=20, 
        choices=[
            ('locked', 'Locked'),
            ('current', 'Current'),
            ('completed', 'Completed'),
        ], 
        default='locked'
    )
    stars_earned = models.IntegerField(default=0)
    # Track individual questions
    questions_completed = models.IntegerField(default=0)
    questions_correct = models.IntegerField(default=0)
    
    attempts = models.IntegerField(default=0)
    completed_at = models.DateTimeField(
        null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'lesson']
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.lesson}"

    @property
    def accuracy(self):
        if self.questions_completed == 0:
            return 0
        return (self.questions_correct / self.questions_completed) * 100



class AssessmentQuestion(models.Model):
    language_pair = models.ForeignKey(
        LanguagePair, on_delete=models.CASCADE, related_name='assessment_questions')
    question = models.TextField()
    correct_answer = models.CharField(max_length=200)
    difficulty = models.IntegerField(default=1)  # 1-4
    order = models.IntegerField()
    explanation = models.TextField(blank=True)


class AssessmentResult(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='assessment_results')
    user_lang_pair = models.ForeignKey(
        UserLanguagePair, related_name='assessment_results', on_delete=models.CASCADE)
    score = models.IntegerField()
    total_questions = models.IntegerField()
    determined_level = models.CharField(max_length=20)
    completed_at = models.DateTimeField(auto_now_add=True)



class QuestionAttempt(models.Model):
    """Record each question attempt for spaced repetition"""
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='question_attempts')
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, related_name='question_attempts')

    user_answer = models.TextField()
    is_correct = models.BooleanField()
    time_spent_sec = models.IntegerField(
        null=True, blank=True)
    attempted_at = models.DateTimeField(auto_now_add=True)

    next_review_date = models.DateField(null=True, blank=True)
    review_interval_days = models.IntegerField(default=1)

    class Meta:
        ordering = ['-attempted_at']

    def __str__(self):
        return f"{self.user.username} - Q{self.question.id} ({'✓' if self.is_correct else '✗'})"
        
