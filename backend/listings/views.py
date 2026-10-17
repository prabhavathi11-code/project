from rest_framework import generics, filters, status, exceptions
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from .models import Listing
from .serializers import ListingSerializer
from .filters import ListingFilter
from .pagination import StandardListingPagination

class ListingListCreateView(generics.ListCreateAPIView):
    serializer_class = ListingSerializer
    pagination_class = StandardListingPagination
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ListingFilter
    search_fields = ['title', 'hostel']
    ordering_fields = ['price', 'rating', 'created_at']
    ordering = ['id']

    def get_queryset(self):
        # Swap queryset for get_queryset so dynamic evaluation occurs per request
        req = self.request
        is_senior = req.query_params.get('is_senior_deal') or req.query_params.get('isseniordeal')
        
        # If Senior-Only Deals are explicitly requested, user MUST be authenticated
        if is_senior and is_senior.lower() in ['true', '1']:
            if not req.user.is_authenticated:
                raise exceptions.AuthenticationFailed("Authentication required for Senior-Only Deals.")
            return Listing.objects.filter(is_senior_deal=True).order_by('id')
            
        return Listing.objects.all().order_by('id')

    def perform_create(self, serializer):
        if not self.request.user.is_authenticated:
            raise exceptions.NotAuthenticated("Must be logged in to create a listing.")
        serializer.save(seller=self.request.user)

class ListingDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ListingSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Listing.objects.all()

    def get_object(self):
        obj = super().get_object()
        # If listing is senior deal and visitor is not authenticated, refuse with 401
        if obj.is_senior_deal and not self.request.user.is_authenticated:
            raise exceptions.AuthenticationFailed("Authentication required for Senior Deals.")
        return obj

    def perform_update(self, serializer):
        listing = self.get_object()
        if listing.seller != self.request.user:
            raise exceptions.PermissionDenied("You do not have permission to edit this listing.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.seller != self.request.user:
            raise exceptions.PermissionDenied("You do not have permission to delete this listing.")
        instance.delete()

class SimilarListingsView(generics.ListAPIView):
    serializer_class = ListingSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        pk = self.kwargs.get('pk')
        try:
            current = Listing.objects.get(pk=pk)
            # Find listings in the same category or hostel excluding current
            qs = Listing.objects.filter(category=current.category).exclude(pk=pk)
            if not self.request.user.is_authenticated:
                qs = qs.filter(is_senior_deal=False)
            return qs[:4]
        except Listing.DoesNotExist:
            return Listing.objects.none()
