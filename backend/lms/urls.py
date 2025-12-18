# lms/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'languages', views.LanguageViewSet, basename='language')
router.register(r'books', views.BookViewSet, basename='book')
router.register(r'questions', views.QuestionViewSet, basename='question')
router.register(r'progress', views.UserProgressViewSet, basename='progress')
router.register(r'attempts', views.QuizAttemptViewSet, basename='attempt')

urlpatterns = [
    # API routes from router
    path('', include(router.urls)),

    # Authentication endpoints
    path('auth/register/', views.register_view, name='register'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/me/', views.current_user_view, name='current-user'),

    # Pronunciation endpoint
    path('pronunciation/', views.get_pronunciation, name='pronunciation'),
]
