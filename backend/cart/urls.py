from django.urls import path
from .views import CartView, CartAddItemView, CartItemDetailView

urlpatterns = [
    path('', CartView.as_view(), name='cart_view'),
    path('add/', CartAddItemView.as_view(), name='cart_add'),
    path('items/<int:pk>/', CartItemDetailView.as_view(), name='cart_item_detail'),
]
