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


class Category(UUIDMixin, TimeStampedMixin):
    name = models.CharField(_('name'), max_length=100, unique=True)
    slug = models.SlugField(_('slug'), max_length=100, unique=True)
    is_active = models.BooleanField(_('is active'), default=True)

    class Meta:
        db_table = "catalog\".\"categories"
        verbose_name = _('Categoría')
        verbose_name_plural = _('Categorías')

    def __str__(self):
        return self.name


class TShirt(UUIDMixin, TimeStampedMixin):
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='t_shirts',
        verbose_name=_('category')
    )
    name = models.CharField(_('name'), max_length=255)
    description = models.TextField(_('description'), blank=True)
    material = models.CharField(_('material'), max_length=100, blank=True)
    base_price = models.DecimalField(
        _('base price'),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    is_active = models.BooleanField(_('is active'), default=True)

    class Meta:
        db_table = "catalog\".\"t_shirts"
        verbose_name = _('Polera')
        verbose_name_plural = _('Poleras')

    def __str__(self):
        return self.name


class TShirtImage(UUIDMixin, TimeStampedMixin):
    t_shirt = models.ForeignKey(
        TShirt,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name=_('t_shirt')
    )
    image = models.ImageField(_('image'), upload_to='t_shirts/')
    is_primary = models.BooleanField(_('is primary'), default=False)

    class Meta:
        db_table = "catalog\".\"t_shirt_images"
        verbose_name = _('Imagen')
        verbose_name_plural = _('Imágenes')

    def __str__(self):
        return f'Imagen de {self.t_shirt.name}'


class SizeChoices(models.TextChoices):
    XS  = 'XS',  'XS'
    S   = 'S',   'S'
    M   = 'M',   'M'
    L   = 'L',   'L'
    XL  = 'XL',  'XL'
    XXL = 'XXL', 'XXL'


class TShirtSize(UUIDMixin, TimeStampedMixin):
    t_shirt = models.ForeignKey(
        TShirt,
        on_delete=models.CASCADE,
        related_name='sizes',
        verbose_name=_('t_shirt')
    )
    size_label = models.CharField(
        _('size'),
        max_length=10,
        choices=SizeChoices.choices
    )
    is_available = models.BooleanField(_('is available'), default=True)

    class Meta:
        db_table = "catalog\".\"t_shirt_sizes"
        verbose_name = _('Talla')
        verbose_name_plural = _('Tallas')
        unique_together = ('t_shirt', 'size_label')

    def __str__(self):
        return f'{self.t_shirt.name} — {self.size_label}'


class PresetDesign(UUIDMixin, TimeStampedMixin):
    name = models.CharField(_('name'), max_length=255)
    image = models.ImageField(_('image'), upload_to='designs/')
    is_active = models.BooleanField(_('is active'), default=True)

    class Meta:
        db_table = "catalog\".\"preset_designs"
        verbose_name = _('Diseño prediseñado')
        verbose_name_plural = _('Diseños prediseñados')

    def __str__(self):
        return self.name