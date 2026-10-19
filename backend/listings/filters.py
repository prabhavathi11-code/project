import django_filters
from .models import Listing

class ListingFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name='category', lookup_expr='iexact')
    hostel = django_filters.CharFilter(field_name='hostel', lookup_expr='iexact')
    branch = django_filters.CharFilter(field_name='branch', lookup_expr='iexact')
    semester = django_filters.NumberFilter(field_name='semester')
    subject_code = django_filters.CharFilter(field_name='subject_code', lookup_expr='icontains')
    rating = django_filters.NumberFilter(field_name='rating', lookup_expr='gte')
    is_senior_deal = django_filters.BooleanFilter(field_name='is_senior_deal')
    isseniordeal = django_filters.BooleanFilter(field_name='is_senior_deal')

    class Meta:
        model = Listing
        fields = [
            'category',
            'hostel',
            'branch',
            'semester',
            'subject_code',
            'rating',
            'is_senior_deal',
            'isseniordeal'
        ]
