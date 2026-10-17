from django.urls import path
from .views import (
    SellerListingListView,
    SellerListingDetailView,
    SellerOrdersListView,
    SellerOrderItemStatusView,
    SellerDashboardView
)

urlpatterns = [
    path('listings/', SellerListingListView.as_view(), name='seller_listings'),
    path('listings/<int:pk>/', SellerListingDetailView.as_view(), name='seller_listing_detail'),
    path('orders/', SellerOrdersListView.as_view(), name='seller_orders'),
    path('orders/<int:pk>/status/', SellerOrderItemStatusView.as_view(), name='seller_order_item_status'),
    path('dashboard/', SellerDashboardView.as_view(), name='seller_dashboard'),
]
