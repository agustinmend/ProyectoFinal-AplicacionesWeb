from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import QuoteConfig


@admin.register(QuoteConfig)
class QuoteConfigAdmin(admin.ModelAdmin):
    list_display = ('config_type', 'label', 'extra_cost', 'is_active', 'created', 'modified')
    list_editable = ('extra_cost', 'is_active')
    list_filter = ('config_type', 'is_active')
    search_fields = ('label',)
    fieldsets = (
        (_('Tipo y etiqueta'), {
            'fields': ('config_type', 'label'),
            'description': _('Define si esta configuración es para ubicación o tamaño del estampado')
        }),
        (_('Costo y estado'), {
            'fields': ('extra_cost', 'is_active')
        }),
    )