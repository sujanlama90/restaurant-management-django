from django.urls import path
from django.contrib.auth import views as auth_views
from .views import *
urlpatterns = [
     path('',index,name='index'),
     path('about/',about,name='about'),
     path('menu/',menu,name='menu'),
     path('chefs/',chefs,name='chefs'),
     path('reservation/',reservation,name='reservation'),
     path('contact/',contact,name='contact'),
     # Cart URLs
     path('cart/', view_cart, name='cart'),
     path('add-to-cart/', add_to_cart, name='add_to_cart'),
     path('update-cart-item/', update_cart_item, name='update_cart_item'),
     path('remove-from-cart/', remove_from_cart, name='remove_from_cart'),
     path('clear-cart/', clear_cart, name='clear_cart'),
     #login urls
     path('login/',log_in,name='log_in'),
     path('register/',register,name='register'),
     path('logout/',log_out,name='log_out'),
     path('password_change/',password_change,name='password_change'),
     path('password_reset/',auth_views.PasswordResetView.as_view(template_name='account/password_reset.html'),name='password_reset'),
     path('password_reset_done/',auth_views.PasswordResetDoneView.as_view(template_name='account/password_reset_done.html'),name='password_reset_done'),
     path('password_reset_confirm/<uidb64>/<token>/',auth_views.PasswordResetConfirmView.as_view(template_name='account/password_reset_confirm.html'),name='password_reset_confirm'),
     path('password_reset_complete/', auth_views.PasswordResetCompleteView.as_view(template_name='account/password_reset_complete.html'),name='password_reset_complete'),
]
