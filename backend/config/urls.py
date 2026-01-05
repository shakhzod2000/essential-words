# config/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.permissions import AllowAny
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
import debug_toolbar
from lms import views as lms_views


schema_view = get_schema_view(
   openapi.Info(
      title="Essential Words API",
      default_version='v1',
      description="API for Essential Words language learning platform",
   ),
   public=True,
   permission_classes=[AllowAny],
)


urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth
    path('register/', lms_views.register_view, name='register'),
    path('login/', lms_views.login_view, name='login'),
    path('logout/', lms_views.logout_view, name='logout'),
    path('me/', lms_views.current_user_view, name='current_user'),

    # LMS
    path('lms/', include('lms.urls')),

    # Google
    path('auth/google/', include('social_django.urls', namespace='social')),

    # API documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('_debug_/', include(debug_toolbar.urls)),
]
