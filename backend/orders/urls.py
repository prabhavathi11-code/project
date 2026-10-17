from django.urls import path
from .views import OrderListView, CheckoutView, OrderDetailView, OrderCancelView

urlpatterns = [
    path('', OrderListView.as_view(), name='order_list'),
    path('checkout/', CheckoutView.as_view(), name='order_checkout'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order_detail'),
    path('<int:pk>/cancel/', OrderCancelView.as_view(), name='order_cancel'),
]
