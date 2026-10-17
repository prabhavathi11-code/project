from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, exceptions
from rest_framework.permissions import IsAuthenticated
from decimal import Decimal

from .models import Order, OrderItem
from .serializers import OrderSerializer, CheckoutSerializer
from cart.models import Cart

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart_items = cart.items.select_related('listing', 'listing__seller').all()

        if not cart_items.exists():
            return Response({"detail": "Cart is empty. Cannot checkout."}, status=status.HTTP_400_BAD_REQUEST)

        validated_data = serializer.validated_data
        payment_method = validated_data.get('payment_method', 'COD')
        meetup_point = validated_data.get('meetup_point', 'LIBRARY')
        address_data = validated_data.get('address', {})

        # Create Order
        order = Order.objects.create(
            user=request.user,
            payment_method=payment_method,
            meetup_point=meetup_point,
            address=address_data,
            status='placed',
            is_paid=False,
            total_price=Decimal('0.00')
        )

        total_price = Decimal('0.00')
        for item in cart_items:
            listing = item.listing
            item_total = listing.price * item.quantity
            total_price += item_total

            OrderItem.objects.create(
                order=order,
                listing=listing,
                seller=listing.seller,
                title=listing.title,
                hostel=listing.hostel,
                condition=listing.condition,
                imageUrl=listing.imageUrl,
                price=listing.price,
                quantity=item.quantity,
                status='placed'
            )

        order.total_price = total_price
        order.save()

        # Clear cart on successful checkout
        cart.items.all().delete()

        out_serializer = OrderSerializer(order)
        return Response(out_serializer.data, status=status.HTTP_201_CREATED)

class OrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).prefetch_related('items')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class OrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            # Only buyer or a seller of items in order can see order
            order = Order.objects.prefetch_related('items').get(pk=pk)
            is_buyer = (order.user == request.user)
            is_item_seller = order.items.filter(seller=request.user).exists()
            if not (is_buyer or is_item_seller or request.user.is_staff):
                raise exceptions.NotFound("No such order found.")
        except Order.DoesNotExist:
            raise exceptions.NotFound("No such order found.")

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)

class OrderCancelView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            raise exceptions.NotFound("No such order found.")

        if not order.can_cancel:
            return Response(
                {"detail": f"Order #{pk} cannot be cancelled as it is already {order.status}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = 'cancelled'
        order.save()
        order.items.all().update(status='cancelled')

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)
