from django.contrib import admin

# Register your models here.
from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import Category, TShirt, TShirtImage, TShirtSize, PresetDesign


class TShirtImageInline(admin.TabularInline):
    model = TShirtImage
    extra = 1
    fields = ('image', 'is_primary', 'preview')
    readonly_fields = ('preview',)

    def preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" height="60"/>', obj.image.url)
        return '—'
    preview.short_description = _('Vista previa')


class TShirtSizeInline(admin.TabularInline):
    model = TShirtSize
    extra = 6
    fields = ('size_label', 'is_available')


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active', 'created', 'modified')
    list_editable = ('is_active',)
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)


@admin.register(TShirt)
class TShirtAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'base_price', 'material', 'is_active', 'created', 'modified')
    list_editable = ('is_active', 'base_price')
    list_filter = ('category', 'is_active', 'material')
    search_fields = ('name', 'description')
    inlines = (TShirtImageInline, TShirtSizeInline)
    fieldsets = (
        (_('Información básica'), {
            'fields': ('category', 'name', 'description', 'material')
        }),
        (_('Precio y estado'), {
            'fields': ('base_price', 'is_active')
        }),
    )


@admin.register(PresetDesign)
class PresetDesignAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'preview', 'created', 'modified')
    list_editable = ('is_active',)
    search_fields = ('name',)

    def preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" height="60"/>', obj.image.url)
        return '—'
    preview.short_description = _('Vista previa')