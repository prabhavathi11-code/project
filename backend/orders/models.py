from django.db import models
from django.conf import settings
from decimal import Decimal
from listings.models import Listing

class Order(models.Model):
    STATUS_CHOICES = (
        ('placed', 'Placed'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )
    PAYMENT_CHOICES = (
        ('COD', 'Cash on Delivery (Meetup)'),
        ('ONLINE', 'Online Payment'),
    )
    MEETUP_CHOICES = (
        ('LIBRARY', 'Library Steps'),
        ('MAIN_GATE', 'Main Gate'),
        ('CANTEEN', 'Canteen'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    payment_method = models.CharField(max_length=50, choices=PAYMENT_CHOICES, default='COD')
    meetup_point = models.CharField(max_length=100, default='LIBRARY')
    address = models.JSONField(default=dict)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='placed')
    is_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} - {self.user.username} ({self.status})"

    @property
    def can_cancel(self):
        return self.status == 'placed'

    def update_status_from_items(self):
        items = self.items.all()
        if not items.exists():
            return
        
        statuses = [item.status for item in items]
        if all(s == 'delivered' for s in statuses):
            self.status = 'delivered'
            self.is_paid = True
        elif all(s == 'cancelled' for s in statuses):
            self.status = 'cancelled'
        elif any(s == 'shipped' for s in statuses) or any(s == 'delivered' for s in statuses):
            self.status = 'shipped'
        else:
            self.status = 'placed'
        self.save()

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    listing = models.ForeignKey(Listing, null=True, on_delete=models.SET_NULL, related_name='order_items')
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='seller_order_items')
    
    # Copied fields for historical preservation
    title = models.CharField(max_length=255)
    hostel = models.CharField(max_length=100)
    condition = models.CharField(max_length=50)
    imageUrl = models.URLField(max_length=500)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=Order.STATUS_CHOICES, default='placed')

    def __str__(self):
        return f"{self.quantity}x {self.title} in Order #{self.order.id}"

    @property
    def item_total(self):
        return f"{(self.price * self.quantity):.2f}"
