from django.contrib import admin
from .models import Template, Connector, Cache


class CacheAdmin(admin.ModelAdmin):
  list_display = (
      'id',
      'uuid',
      'template_id',
      'task_status',
      'storage',
      'stage',
      'public',
      'created_at',
      'updated_at')

class TemplateAdmin(admin.ModelAdmin):
  list_display = (
      'id',
      'name',
      'created_at',
      'updated_at')

class ConnectorAdmin(admin.ModelAdmin):
  list_display = (
      'id',
      'name',
      'created_at',
      'updated_at')

admin.site.register(Cache, CacheAdmin)
admin.site.register(Template, TemplateAdmin)
admin.site.register(Connector, ConnectorAdmin)
