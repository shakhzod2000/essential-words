# lms/admin.py
from django.contrib import admin
from .models import (
    Language, LanguagePair, Book, Unit, Lesson, Question, QuestionOption,
    UserLanguagePair, UserLessonProgress, AssessmentQuestion, AssessmentResult,
    QuestionAttempt, GrammarTopic, GrammarLesson, Vocabulary, VocabularyTranslation
)


# Inlines
class QuestionOptionInline(admin.TabularInline):
    model = QuestionOption
    extra = 3
    fields = ['text', 'is_correct', 'order']


class VocabularyTranslationInline(admin.TabularInline):
    model = VocabularyTranslation
    extra = 2
    fields = ['language', 'translation', 'example_translation']


class VocabularyInline(admin.TabularInline):
    model = Vocabulary
    extra = 1
    fields = ['word_number', 'word', 'part_of_speech']
    show_change_link = True


class GrammarLessonInline(admin.TabularInline):
    model = GrammarLesson
    extra = 1
    fields = ['order', 'title', 'explanation_lang']
    show_change_link = True


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1
    fields = ['order', 'title', 'lesson_type', 'total_stars', 'xp_reward', 'is_published']
    show_change_link = True


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1
    fields = ['order', 'question_type', 'prompt', 'correct_answer']
    show_change_link = True


class UnitInline(admin.TabularInline):
    model = Unit
    extra = 1
    fields = ['number', 'title', 'is_published']
    show_change_link = True


# Main Admin Classes
@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'flag_image']
    search_fields = ['name', 'code']
    ordering = ['name']


@admin.register(LanguagePair)
class LanguagePairAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'from_lang', 'target_lang', 'is_active']
    list_filter = ['is_active', 'from_lang', 'target_lang']
    search_fields = ['from_lang__name', 'target_lang__name']


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ['title', 'language', 'cefr_level', 'created_at', 'updated_at']
    list_filter = ['language', 'cefr_level', 'created_at']
    search_fields = ['title', 'description']
    ordering = ['language', 'title']


@admin.register(GrammarTopic)
class GrammarTopicAdmin(admin.ModelAdmin):
    list_display = ['title', 'language', 'cefr_level', 'order']
    list_filter = ['language', 'cefr_level']
    search_fields = ['title', 'description']
    ordering = ['language', 'cefr_level', 'order']
    inlines = [GrammarLessonInline]


@admin.register(GrammarLesson)
class GrammarLessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'topic', 'unit', 'explanation_lang', 'order']
    list_filter = ['topic__language', 'topic__cefr_level', 'explanation_lang']
    search_fields = ['title', 'explanation']
    ordering = ['topic', 'order']


@admin.register(Vocabulary)
class VocabularyAdmin(admin.ModelAdmin):
    list_display = ['word', 'unit', 'word_number', 'part_of_speech']
    list_filter = ['unit__book', 'part_of_speech']
    search_fields = ['word', 'example_sentence']
    ordering = ['unit', 'word_number']
    inlines = [VocabularyTranslationInline]


@admin.register(VocabularyTranslation)
class VocabularyTranslationAdmin(admin.ModelAdmin):
    list_display = ['vocabulary', 'language', 'translation']
    list_filter = ['language', 'vocabulary__unit__book']
    search_fields = ['translation', 'vocabulary__word']
    ordering = ['vocabulary', 'language']


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ['number', 'title', 'book', 'lang_pair', 'is_published']
    list_filter = ['book', 'lang_pair', 'is_published']
    search_fields = ['title', 'description']
    ordering = ['book', 'lang_pair', 'number']
    inlines = [LessonInline, VocabularyInline]


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'unit', 'order', 'lesson_type', 'grammar_topic', 'total_stars', 'xp_reward', 'is_published']
    list_filter = ['unit__book', 'lesson_type', 'is_published']
    search_fields = ['title', 'unit__title']
    ordering = ['unit', 'order']
    inlines = [QuestionInline]


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'lesson', 'question_type', 'order']
    list_filter = ['question_type', 'lesson__unit__book']
    search_fields = ['prompt', 'correct_answer']
    ordering = ['lesson', 'order']
    inlines = [QuestionOptionInline]
    readonly_fields = ['created_at', 'updated_at']


@admin.register(QuestionOption)
class QuestionOptionAdmin(admin.ModelAdmin):
    list_display = ['text', 'question', 'is_correct', 'order']
    list_filter = ['is_correct', 'question__lesson__unit__book']
    search_fields = ['text', 'question__prompt']
    ordering = ['question', 'order']


@admin.register(UserLanguagePair)
class UserLanguagePairAdmin(admin.ModelAdmin):
    list_display = ['user', 'lang_pair', 'cefr_level', 'level_progress_percent', 'total_words_learned', 'total_xp', 'curr_streak']
    list_filter = ['cefr_level', 'lang_pair']
    search_fields = ['user__username']
    ordering = ['-total_xp']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(UserLessonProgress)
class UserLessonProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'lesson', 'status', 'stars_earned', 'accuracy', 'attempts']
    list_filter = ['status', 'lesson__unit__book']
    search_fields = ['user__username', 'lesson__title']
    ordering = ['-updated_at']
    readonly_fields = ['updated_at', 'completed_at']

    def accuracy(self, obj):
        return f"{obj.accuracy:.1f}%"
    accuracy.short_description = 'Accuracy'


@admin.register(AssessmentQuestion)
class AssessmentQuestionAdmin(admin.ModelAdmin):
    list_display = ['question', 'language_pair', 'difficulty', 'order', 'correct_answer']
    list_filter = ['language_pair', 'difficulty']
    search_fields = ['question', 'correct_answer', 'explanation']
    ordering = ['language_pair', 'order']


@admin.register(AssessmentResult)
class AssessmentResultAdmin(admin.ModelAdmin):
    list_display = ['user', 'user_lang_pair', 'score', 'total_questions', 'determined_level', 'completed_at']
    list_filter = ['determined_level', 'completed_at']
    search_fields = ['user__username']
    ordering = ['-completed_at']
    readonly_fields = ['completed_at']


@admin.register(QuestionAttempt)
class QuestionAttemptAdmin(admin.ModelAdmin):
    list_display = ['user', 'question', 'is_correct', 'time_spent_sec', 'next_review_date', 'attempted_at']
    list_filter = ['is_correct', 'question__lesson__unit__book', 'attempted_at']
    search_fields = ['user__username', 'question__prompt']
    ordering = ['-attempted_at']
    readonly_fields = ['attempted_at']
