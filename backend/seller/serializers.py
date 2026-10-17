from rest_framework import serializers
from listings.models import Listing
from orders.models import OrderItem, Order

class SellerListingSerializer(serializers.ModelSerializer):
    image_url = serializers.CharField(source='imageUrl', required=False)
    imageUrl = serializers.CharField(required=False, write_only=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=True)

    class Meta:
        model = Listing
        fields = [
            'id',
            'title',
            'hostel',
            'condition',
            'negotiable',
            'category',
            'price',
            'image_url',
            'imageUrl',
            'rating',
            'total_reviews',
            'availability',
            'is_senior_deal',
            'description',
            'created_at'
        ]
        read_only_fields = ['id', 'rating', 'total_reviews', 'created_at']

    def validate(self, attrs):
        # Allow either image_url or imageUrl
        if 'imageUrl' in attrs:
            attrs['imageUrl'] = attrs.pop('imageUrl')
        return attrs

class SellerOrderItemSerializer(serializers.ModelSerializer):
    order_id = serializers.ReadOnlyField(source='order.id')
    buyer_username = serializers.ReadOnlyField(source='order.user.username')
    buyer_name = serializers.SerializerMethodField()
    buyer_phone = serializers.SerializerMethodField()
    meetup_point = serializers.ReadOnlyField(source='order.meetup_point')
    payment_method = serializers.ReadOnlyField(source='order.payment_method')
    order_created_at = serializers.ReadOnlyField(source='order.created_at')
    amount = serializers.ReadOnlyField(source='item_total')
    image_url = serializers.ReadOnlyField(source='imageUrl')

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'order_id',
            'listing',
            'title',
            'hostel',
            'condition',
            'image_url',
            'price',
            'quantity',
            'amount',
            'status',
            'buyer_username',
            'buyer_name',
            'buyer_phone',
            'meetup_point',
            'payment_method',
            'order_created_at'
        ]

    def get_buyer_name(self, obj):
        addr = obj.order.address or {}
        return addr.get('full_name', obj.order.user.username)

    def get_buyer_phone(self, obj):
        addr = obj.order.address or {}
        return addr.get('phone', 'N/A')
