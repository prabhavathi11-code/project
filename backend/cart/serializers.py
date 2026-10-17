from rest_framework import serializers
from .models import Cart, CartItem
from listings.models import Listing

class CartItemSerializer(serializers.ModelSerializer):
    listing_title = serializers.ReadOnlyField(source='listing.title')
    listing_condition = serializers.ReadOnlyField(source='listing.condition')
    listing_price = serializers.SerializerMethodField()
    listing_imageUrl = serializers.ReadOnlyField(source='listing.imageUrl')
    listing_hostel = serializers.ReadOnlyField(source='listing.hostel')

    class Meta:
        model = CartItem
        fields = [
            'id',
            'listing',
            'listing_title',
            'listing_condition',
            'listing_price',
            'listing_imageUrl',
            'listing_hostel',
            'quantity'
        ]

    def get_listing_price(self, obj):
        return f"{obj.listing.price:.2f}"

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.ReadOnlyField()
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_items', 'total_price']
