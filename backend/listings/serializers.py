from rest_framework import serializers
from .models import Listing

class ListingSerializer(serializers.ModelSerializer):
    seller_username = serializers.ReadOnlyField(source='seller.username')
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
            'imageUrl',
            'rating',
            'total_reviews',
            'availability',
            'is_senior_deal',
            'description',
            'branch',
            'semester',
            'subject_code',
            'author',
            'seller',
            'seller_username',
            'created_at'
        ]
        read_only_fields = ['id', 'seller', 'seller_username', 'created_at']
