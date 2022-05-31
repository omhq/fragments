from django.db import models
from organizations.models import Organization


class Cache(models.Model):
    """
    Cache represents the data that was generated from a model.

    task_status:
        - 0 default
        - 1 failed
        - 2 success
        - 3 running

    storage:
        - 0 file system

    stage:
        - 0 testing
        - 1 production

    public:
        - 0 false
        - 1 true
    """

    org = models.ForeignKey(
        Organization,
        blank=True,
        null=True,
        related_name="caches",
        on_delete=models.CASCADE,
    )
    uuid = models.CharField(max_length=500, blank=True, null=True, unique=True)
    template_id = models.SmallIntegerField(blank=False, null=False)
    task_id = models.CharField(max_length=500, blank=True, null=True)
    task_status = models.SmallIntegerField(blank=False, null=False, default=0)
    storage = models.SmallIntegerField(blank=False, null=False)
    stage = models.SmallIntegerField(blank=False, null=False, default=0)
    public = models.SmallIntegerField(blank=False, null=False, default=0)
    path = models.CharField(max_length=500, blank=True, null=True)
    update_key = models.CharField(max_length=500, blank=True, null=True)

    created_at: models.DateTimeField = models.DateTimeField(auto_now_add=True)
    updated_at: models.DateTimeField = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Cache"
        verbose_name_plural = "Caches"
        ordering = ["-created_at"]
