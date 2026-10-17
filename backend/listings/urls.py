from django.urls import path
from .views import ListingListCreateView, ListingDetailView, SimilarListingsView

urlpatterns = [
    path('', ListingListCreateView.as_view(), name='listing_list_create'),
    path('<int:pk>/', ListingDetailView.as_view(), name='listing_detail'),
    path('<int:pk>/similar/', SimilarListingsView.as_view(), name='similar_listings'),
]
