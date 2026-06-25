import uuid
from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _


class UUIDMixin(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class TimeStampedMixin(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class ConfigType(models.TextChoices):
    PRINT_LOCATION = 'print_location', _('Ubicación de estampado')
    PRINT_SIZE     = 'print_size',     _('Tamaño de estampado')


class QuoteConfig(UUIDMixin, TimeStampedMixin):
    config_type = models.CharField(
        _('config type'),
        max_length=50,
        choices=ConfigType.choices
    )
    label = models.CharField(
        _('label'),
        max_length=100,
        help_text=_('Ej: Pecho, Espalda, Manga / Pequeño, Mediano, Grande')
    )
    extra_cost = models.DecimalField(
        _('extra cost'),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text=_('Costo adicional que se suma al precio base de la polera')
    )
    is_active = models.BooleanField(_('is active'), default=True)

    class Meta:
        managed = False
        db_table = "negocio\".\"quote_configs"
        verbose_name = _('Configuración de cotización')
        verbose_name_plural = _('Configuraciones de cotización')
        unique_together = ('config_type', 'label')

    def __str__(self):
        return f'{self.get_config_type_display()} — {self.label} (${self.extra_cost})'