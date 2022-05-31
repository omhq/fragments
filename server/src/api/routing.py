from django.urls import include, path

from rest_framework.routers import DefaultRouter
from rest_framework_extensions.routers import ExtendedDefaultRouter

from .views import connector, template, view, cache, user


class DefaultRouterPlusPlus(ExtendedDefaultRouter):
    """DefaultRouter with optional trailing slash and drf-extensions nesting."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.trailing_slash = r"/?"


router = DefaultRouter()

api_urls = [
    path("", include(router.urls)),
    path("view/<str:template_id>/", view.ViewGenericAPIView.as_view()),
    path("templates/", template.TemplateListCreateAPIView.as_view()),
    path("templates/<str:template_id>/", template.TemplateGenericAPIView.as_view()),
    path("templates/test/<str:template_id>/", template.TemplateTest.as_view()),
    path(
        "templates/test/results/<str:template_id>/<str:stage>/",
        template.TemplateTestResults.as_view(),
    ),
    path("templates/deploy/<str:template_id>/", template.TemplateDeploy.as_view()),
    path(
        "templates/deploy/status/<str:template_id>/<str:stage>/",
        template.TemplateDeployStatus.as_view(),
    ),
    path(
        "templates/undeploy/<str:template_id>/<str:stage>/",
        template.TemplateUndeploy.as_view(),
    ),
    path("connectors/", connector.ConnectorListCreateAPIView.as_view()),
    path("connectors/<str:connector_id>/", connector.ConnectorGenericAPIView.as_view()),
    path("caches/", cache.CacheGenericAPIView.as_view()),
    path("auth/self/", user.UserGenericAPIView.as_view()),
    path("auth/", include("dj_rest_auth.urls")),
    path("auth/registration/", include("dj_rest_auth.registration.urls")),
]
