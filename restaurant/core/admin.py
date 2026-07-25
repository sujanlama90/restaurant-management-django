from django.contrib import admin
from .models import *

@admin.register(MenuCategory)
class MenuCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "price", "is_featured", "is_hot")
    list_filter = ("category", "is_featured", "is_hot")
    search_fields = ("title", "description", "tags")
    
@admin.register(Gallery)
class GalleryAdmin(admin.ModelAdmin):
    list_display = ('title','description')
    
@admin.register(Chefs)
class ChefsAdmin(admin.ModelAdmin):
    list_display =['name','role']

@admin.register(Reservation)
class ChefsAdmin(admin.ModelAdmin):
    list_display =['name']
    
@admin.register(Contact)
class ChefsAdmin(admin.ModelAdmin):
    list_display =['name']


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'user', 'created_at', 'get_total_items')
    readonly_fields = ('session_id', 'created_at', 'updated_at')
    

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'cart', 'menu_item', 'quantity', 'get_subtotal')
    readonly_fields = ('created_at', 'updated_at')
