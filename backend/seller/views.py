from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, exceptions, generics, filters
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Sum, Count, Q
from decimal import Decimal
from datetime import timedelta

from listings.models import Listing
from listings.pagination import StandardListingPagination
from orders.models import OrderItem, Order
from .serializers import SellerListingSerializer, SellerOrderItemSerializer

class SellerListingListView(generics.ListCreateAPIView):
    serializer_class = SellerListingSerializer
    pagination_class = StandardListingPagination
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'hostel', 'category']
    ordering_fields = ['price', 'created_at']
    ordering = ['-id']

    def get_queryset(self):
        return Listing.objects.filter(seller=self.request.user)

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

class SellerListingDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SellerListingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Listing.objects.all()

    def get_object(self):
        pk = self.kwargs.get('pk')
        try:
            listing = Listing.objects.get(pk=pk)
        except Listing.DoesNotExist:
            raise exceptions.NotFound("Listing not found.")

        # If user is not the seller who owns it, return 403 Forbidden!
        if listing.seller != self.request.user:
            raise exceptions.PermissionDenied("You do not have permission to edit or delete this listing.")
        return listing

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

class SellerOrdersListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = OrderItem.objects.filter(seller=request.user).select_related('order', 'order__user').order_by('-order__created_at')
        serializer = SellerOrderItemSerializer(items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class SellerOrderItemStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            item = OrderItem.objects.select_related('order').get(pk=pk)
        except OrderItem.DoesNotExist:
            raise exceptions.NotFound("Order item not found.")

        if item.seller != request.user:
            raise exceptions.PermissionDenied("You do not have permission to update this order item.")

        new_status = request.data.get('status')
        if not new_status:
            # Advance to next status: placed -> shipped -> delivered
            if item.status == 'placed':
                new_status = 'shipped'
            elif item.status == 'shipped':
                new_status = 'delivered'
            else:
                new_status = item.status

        valid_statuses = ['placed', 'shipped', 'delivered', 'cancelled']
        if new_status in valid_statuses:
            item.status = new_status
            item.save()

            # Crucial rule: Check and update parent order status
            item.order.update_status_from_items()

        serializer = SellerOrderItemSerializer(item)
        return Response(serializer.data, status=status.HTTP_200_OK)

class SellerDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        items = OrderItem.objects.filter(seller=user).select_related('order')

        # 1. Four number cards
        # Total Sales / Revenue (from delivered orders or total active)
        delivered_items = items.filter(status='delivered')
        total_revenue = sum(item.price * item.quantity for item in delivered_items)
        if total_revenue == 0 and items.exists():
            # If none delivered yet, show total order volume
            total_revenue = sum(item.price * item.quantity for item in items.exclude(status='cancelled'))

        distinct_orders_count = items.values('order').distinct().count()
        active_listings_count = Listing.objects.filter(seller=user, availability='Available').count()
        pending_handovers = items.filter(status__in=['placed', 'shipped'])
        pending_handovers_count = pending_handovers.count()

        # 2. "Still to hand over" strip
        still_to_handover_data = SellerOrderItemSerializer(pending_handovers.order_by('order__created_at'), many=True).data

        # 3. Seven-bar chart for last 7 days (including zero days!)
        now = timezone.now().date()
        chart_bars = []
        for i in range(6, -1, -1):
            day_date = now - timedelta(days=i)
            day_name = day_date.strftime('%a') # Mon, Tue, etc.
            day_label = day_date.strftime('%b %d')

            # Filter items ordered on this date
            day_items = items.filter(order__created_at__date=day_date).exclude(status='cancelled')
            day_sales = sum(item.price * item.quantity for item in day_items)
            day_count = day_items.count()

            chart_bars.append({
                'date': day_date.strftime('%Y-%m-%d'),
                'day_name': day_name,
                'label': f"{day_name} ({day_label})",
                'sales': float(day_sales),
                'orders_count': day_count
            })

        # 4. Top listings panel
        top_listings = (
            items.exclude(status='cancelled')
            .values('listing', 'title')
            .annotate(total_qty=Sum('quantity'), total_amount=Sum('price'))
            .order_by('-total_qty')[:5]
        )

        # 5. Items-by-status panel
        status_counts = {
            'placed': items.filter(status='placed').count(),
            'shipped': items.filter(status='shipped').count(),
            'delivered': items.filter(status='delivered').count(),
            'cancelled': items.filter(status='cancelled').count(),
        }

        return Response({
            'kpis': {
                'total_sales': f"{total_revenue:.2f}",
                'total_orders': distinct_orders_count,
                'active_listings': active_listings_count,
                'pending_handovers': pending_handovers_count
            },
            'still_to_handover': still_to_handover_data,
            'seven_day_chart': chart_bars,
            'top_listings': list(top_listings),
            'items_by_status': status_counts
        }, status=status.HTTP_200_OK)
