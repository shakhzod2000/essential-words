# lms/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'languages', views.LanguageViewSet, basename='language')
router.register(r'language-pairs', views.LanguagePairViewSet, basename='language-pair')
router.register(r'books', views.BookViewSet, basename='book')
router.register(r'units', views.UnitViewSet, basename='unit')
router.register(r'lessons', views.LessonViewSet, basename='lesson')
router.register(r'vocabulary', views.VocabularyViewSet, basename='vocabulary')
router.register(r'questions', views.QuestionViewSet, basename='question')
router.register(r'user-language-pairs', views.UserLanguagePairViewSet, basename='user-language-pair')
router.register(r'lesson-progress', views.UserLessonProgressViewSet, basename='lesson-progress')

urlpatterns = [
    # API routes from router
    path('', include(router.urls)),

    # Pronunciation endpoint
    path('pronunciation/', views.get_pronunciation, name='pronunciation'),
]