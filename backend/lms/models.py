# lms/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator

User = get_user_model()


class Language(models.Model):
    """Language for learning (e.g., English, German)"""
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, unique=True)  # e.g., 'en', 'de'

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Book(models.Model):
    """Textbook/Course (e.g., E1, E2, E3, E4 - Essential 1, 2, 3, 4)"""
    title = models.CharField(max_length=255)
    language = models.ForeignKey(Language, on_delete=models.CASCADE, related_name='books')
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['language', 'title']
        unique_together = ['title', 'language']

    def __str__(self):
        return f"{self.title} ({self.language.name})"


class Question(models.Model):
    """Question in a book unit"""
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='questions')
    unit = models.IntegerField(validators=[MinValueValidator(1)])  # Unit number (1-30)
    order = models.IntegerField(validators=[MinValueValidator(1)])  # Question order within unit (1-20)
    text = models.TextField()
    correct_answer = models.CharField(max_length=255)
    explanation = models.TextField(blank=True)

    class Meta:
        ordering = ['book', 'unit', 'order']
        unique_together = ['book', 'unit', 'order']

    def __str__(self):
        return f"{self.book.title} - Unit {self.unit}, Q{self.order}: {self.text[:50]}"


class Option(models.Model):
    """Answer option for a question"""
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=255)
    order = models.IntegerField(validators=[MinValueValidator(1)])  # Option order (1-4)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['question', 'order']
        unique_together = ['question', 'order']

    def __str__(self):
        return self.text


class UserProgress(models.Model):
    """Track user progress through units"""
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='progress')
    book = models.ForeignKey(
        Book, on_delete=models.CASCADE, related_name='user_progress')
    unit = models.IntegerField(
        validators=[MinValueValidator(1)])
    completed = models.BooleanField(
        default=False)
    score = models.IntegerField(
        null=True, blank=True, validators=[MinValueValidator(0)])
    completed_at = models.DateTimeField(
        null=True, blank=True)
    created_at = models.DateTimeField(
        auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'User Progress'
        unique_together = ['user', 'book', 'unit']
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.user.username} - {self.book.title} Unit {self.unit}"


class QuizAttempt(models.Model):
    """Record of a user's quiz/unit attempt"""
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='quiz_attempts')
    book = models.ForeignKey(
        Book, on_delete=models.CASCADE, related_name='attempts')
    unit = models.IntegerField(
        validators=[MinValueValidator(1)])
    score = models.IntegerField(
        validators=[MinValueValidator(0)])
    total_questions = models.IntegerField(
        validators=[MinValueValidator(1)])
    started_at = models.DateTimeField(
        auto_now_add=True)
    completed_at = models.DateTimeField(
        null=True, blank=True)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.user.username} - {self.book.title} Unit {self.unit} ({self.score}/{self.total_questions})"

    @property
    def percentage(self):
        return (self.score / self.total_questions) * 100 if self.total_questions > 0 else 0
