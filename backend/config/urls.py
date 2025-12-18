# config/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from rest_framework.permissions import AllowAny
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
import debug_toolbar


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
    path('lms/', include('lms.urls')),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('_debug_/', include(debug_toolbar.urls)),
]
