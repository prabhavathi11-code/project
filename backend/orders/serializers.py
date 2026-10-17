from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    price = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=True)
    item_total = serializers.ReadOnlyField()
    seller_username = serializers.ReadOnlyField(source='seller.username')

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'order',
            'listing',
            'seller',
            'seller_username',
            'title',
            'hostel',
            'condition',
            'imageUrl',
            'price',
            'quantity',
            'status',
            'item_total'
        ]

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=True)
    can_cancel = serializers.ReadOnlyField()
    items_count = serializers.SerializerMethodField()
    buyer_username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Order
        fields = [
            'id',
            'buyer_username',
            'payment_method',
            'meetup_point',
            'address',
            'total_price',
            'status',
            'is_paid',
            'can_cancel',
            'items_count',
            'items',
            'created_at'
        ]

    def get_items_count(self, obj):
        return sum(item.quantity for item in obj.items.all())

class CheckoutSerializer(serializers.Serializer):
    payment_method = serializers.CharField(default='COD')
    meetup_point = serializers.CharField(default='LIBRARY')
    address = serializers.DictField()

    def validate_address(self, value):
        required_keys = ['full_name', 'phone', 'address', 'city', 'state', 'pincode']
        for k in required_keys:
            if not value.get(k):
                raise serializers.ValidationError(f"Address field '{k}' is required.")
        return value
