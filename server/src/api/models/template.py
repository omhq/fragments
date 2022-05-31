from django.db import models
from organizations.models import Organization


class Template(models.Model):
    org = models.ForeignKey(
        Organization,
        blank=True,
        null=True,
        related_name="templates",
        on_delete=models.CASCADE,
    )
    name = models.CharField(max_length=500, blank=False, null=False, default="Untitled")
    code = models.TextField(blank=False)
    created_at: models.DateTimeField = models.DateTimeField(auto_now_add=True)
    updated_at: models.DateTimeField = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Template"
        verbose_name_plural = "Templates"
        ordering = ["-created_at"]
