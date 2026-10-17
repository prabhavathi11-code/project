from django.db import models
from django.conf import settings

class Listing(models.Model):
    CONDITION_CHOICES = (
        ('Like New', 'Like New'),
        ('Good', 'Good'),
        ('Fair', 'Fair'),
    )
    CATEGORY_CHOICES = (
        ('Books', 'Books'),
        ('Electronics', 'Electronics'),
        ('Hostel Essentials', 'Hostel Essentials'),
        ('Cycles', 'Cycles'),
        ('Sports', 'Sports'),
    )
    AVAILABILITY_CHOICES = (
        ('Available', 'Available'),
        ('Sold', 'Sold'),
    )

    title = models.CharField(max_length=255)
    hostel = models.CharField(max_length=100)
    condition = models.CharField(max_length=50, choices=CONDITION_CHOICES, default='Good')
    negotiable = models.BooleanField(default=False)
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    imageUrl = models.URLField(max_length=500, default='https://picsum.photos/seed/listing/300/300')
    rating = models.FloatField(default=4.0)
    total_reviews = models.IntegerField(default=10)
    availability = models.CharField(max_length=50, choices=AVAILABILITY_CHOICES, default='Available')
    is_senior_deal = models.BooleanField(default=False)
    description = models.TextField(blank=True, default='')
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='listings')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - ₹{self.price} ({self.seller.username})"
