# lms/admin.py
from django.contrib import admin
from .models import Language, Book, Question, Option, UserProgress, QuizAttempt


class OptionInline(admin.TabularInline):
    model = Option
    extra = 4
    fields = ['text', 'order']


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1
    fields = ['unit', 'order', 'text', 'correct_answer']
    show_change_link = True


@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'created_at']
    search_fields = ['name', 'code']


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ['title', 'language', 'created_at']
    list_filter = ['language']
    search_fields = ['title']
    inlines = [QuestionInline]


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'book', 'unit', 'order', 'correct_answer']
    list_filter = ['book', 'unit']
    search_fields = ['text', 'book__title']
    ordering = ['book', 'unit', 'order']
    inlines = [OptionInline]


@admin.register(Option)
class OptionAdmin(admin.ModelAdmin):
    list_display = ['text', 'question', 'order']
    list_filter = ['question__book']
    ordering = ['question', 'order']


@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'book', 'unit', 'completed', 'score', 'completed_at']
    list_filter = ['completed', 'book']
    search_fields = ['user__username', 'book__title']
    ordering = ['-updated_at']


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ['user', 'book', 'unit', 'score', 'total_questions', 'percentage', 'started_at']
    list_filter = ['book', 'started_at']
    search_fields = ['user__username', 'book__title']
    ordering = ['-started_at']
    readonly_fields = ['started_at', 'completed_at']

    def percentage(self, obj):
        return f"{obj.percentage:.1f}%"
    percentage.short_description = 'Score %'
