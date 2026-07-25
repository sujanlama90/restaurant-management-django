from django.db import models


class MenuCategory(models.Model):
    name = models.CharField(max_length=80,unique=True)
    slug = models.SlugField(max_length=90,unique=True)
    
    class Meta:
        verbose_name = "Menu Category"
        verbose_name_plural = "Menu Categories"
        ordering = ["name"]
        
    def __str__(self):
        return self.name
    

class MenuTag(models.Model):
    name = models.CharField(max_length=50,unique=True)
    
    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
    
class MenuItem(models.Model):
    category = models.ForeignKey(MenuCategory,on_delete=models.SET_NULL,null=True,related_name='items')
    title = models.CharField(max_length=80)
    description = models.TextField()
    image = models.ImageField(upload_to='menu/',blank=True, null=True)
    price = models.DecimalField(max_digits=8,decimal_places=2)
    rating = models.DecimalField(max_digits=3,decimal_places=2,default=5.0)
    review_count = models.PositiveIntegerField(default=0)
    calories = models.PositiveIntegerField(blank=True,null=True)
    prep_time = models.PositiveIntegerField(blank=True,null=True,help_text="Preparation time in minutes")
    tags = models.ManyToManyField(MenuTag,blank=True,related_name="menu_items")
    is_featured = models.BooleanField(default=False)
    is_hot = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return self.title
    

class Gallery(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    image = models.ImageField(upload_to='gallery/')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Gallery"
        verbose_name_plural = "Gallery"

    def __str__(self):
        return self.title
    
class Chefs(models.Model):
    name = models.CharField(max_length=50,null=True)
    role = models.CharField(max_length=90)
    experience =models.CharField(max_length=50)
    image = models.ImageField(upload_to='chefs/')
    display_order = models.PositiveIntegerField(default=0)
    facebook_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["display_order", "name"]
        verbose_name = "Chef"
        verbose_name_plural = "Chefs"

    def __str__(self):
        return self.name
    
class Reservation(models.Model):
    GUEST_CHOICES =[
        ('1','1 person'),
        ('2','2 people'),
        ("3-4", "3 - 4 People"),
        ("5-6", "5 - 6 People"),
        ("7-10", "7 - 10 People"),
        ("10+", "10+ People")
    ]
    TIME_CHOICES = [
        ("09:00 AM", "09:00 AM"),
        ("10:00 AM", "10:00 AM"),
        ("11:00 AM", "11:00 AM"),
        ("12:00 PM", "12:00 PM"),
        ("01:00 PM", "01:00 PM"),
        ("02:00 PM", "02:00 PM"),
        ("06:00 PM", "06:00 PM"),
        ("07:00 PM", "07:00 PM"),
        ("08:00 PM", "08:00 PM"),
        ("09:00 PM", "09:00 PM"),
        ("10:00 PM", "10:00 PM"),
    ]
    
    STATUS_CHOICES = [
    ("Pending", "Pending"),
    ("Confirmed", "Confirmed"),
    ("Cancelled", "Cancelled"),
    ]
    
    name = models.CharField(max_length=50)
    phone = models.CharField(null=True)
    email = models.EmailField()
    reservation_date = models.DateField()
    guest = models.CharField(max_length=100,choices=GUEST_CHOICES)
    reservation_time = models.CharField(max_length=150, choices=TIME_CHOICES)
    special_requests = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField( max_length=20, choices=STATUS_CHOICES, default="Pending"
)
    
    class Meta:
        ordering = ["-created_at"]
        
    def __str__(self):
        return self.name

    
# contact model

class Contact(models.Model):
    SUBJECT_CHOICES = [
        ("General Inquiry", "General Inquiry"),
        ("Catering & Events", "Catering & Events"),
        ("Feedback", "Feedback"),
        ("Partnership", "Partnership"),
        ("Media & Press", "Media & Press"),
    ]
    STATUS_CHOICES = [
    ("Pending", "Pending"),
    ("Replied", "Replied"),
]

    name = models.CharField(max_length=89)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    subject = models.CharField(max_length=550, choices=SUBJECT_CHOICES, default='General Inquiry')
    message = models.TextField()
    status = models.CharField( max_length=20, choices=STATUS_CHOICES, default="Pending")

    created_at = models.DateTimeField(auto_now_add=True)
    
    
    def __str__(self):
        return self.name


# Cart Models
class Cart(models.Model):
    session_id = models.CharField(max_length=100,unique=True,null=True,blank=True)
    user = models.OneToOneField('auth.User', on_delete=models.CASCADE, null=True, blank=True, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Cart - {self.session_id}"
    
    def get_total(self):
        """Calculate total cart value"""
        return sum(item.get_subtotal() for item in self.items.all())
    
    def get_total_items(self):
        """Get total number of items in cart"""
        return sum(item.quantity for item in self.items.all())


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('cart', 'menu_item')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.menu_item.title} x {self.quantity}"
    
    def get_subtotal(self):
        """Calculate subtotal for this item"""
        return self.menu_item.price * self.quantity