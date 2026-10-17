from django.contrib import admin
from django.urls import path, include
from chatbot_view import CampusChatbotView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/listings/', include('listings.urls')),
    path('api/cart/', include('cart.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/seller/', include('seller.urls')),
    path('api/chatbot/', CampusChatbotView.as_view(), name='campus_chatbot'),
]
