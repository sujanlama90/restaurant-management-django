from django.shortcuts import render,redirect
from .models import *
from django.contrib import messages
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_GET
import json
from django.contrib.auth.models import User
import re
from django.contrib import messages
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth.decorators import login_required
from django.template.loader import render_to_string
from django.core.mail import send_mail ,EmailMessage 

# Create your views here.

def index(request):
    return render(request,'core/index.html')

def about(request):
    return render(request,'core/about.html')

@login_required
def menu(request):
    category = MenuCategory.objects.prefetch_related('items__tags').all()
    gallery = Gallery.objects.all()
    
    context = {
        'categories': category,
        'gallery': gallery,
    }
    return render(request,'core/menu.html',context)

def chefs(request):
    chefs = Chefs.objects.filter(is_active = True)
    
    return render(request,'core/chefs.html',{'chefs':chefs})


@login_required
def reservation(request):
    if request.method == "POST":
        name = request.POST.get('name')
        phone = request.POST.get('phone')
        email = request.POST.get('email')
        person = request.POST.get('person')
        reservation_date = request.POST.get('date')
        reservation_time = request.POST.get('time')
        special_requests = request.POST.get('special_requests')

        Reservation.objects.create(name=name,phone=phone,email=email,guest=person,reservation_date=reservation_date,reservation_time=reservation_time,special_requests=special_requests)
         # Email subject
        subject = "🍽️ Your Table Reservation is Confirmed - Suzan Momo Restaurant"

        # Email body
        message = render_to_string( "core/email_message.html",{
                    "name": name,
                    "phone": phone,
                    "email": email,
                    "person": person,
                    "reservation_date": reservation_date,
                    "reservation_time": reservation_time,
                    "special_requests": special_requests, },)

            # Sender's email address
        from_email = "suzanmomorestaurant@gmail.com"

            # Recipient email address
        recipient_list = [email]

            # Send email
        send_mail(
                subject=subject,
                message=message,
                from_email=from_email,
                recipient_list=recipient_list,
                fail_silently=False,
            )
        messages.success(request,"Your table has been reserved successfully. A confirmation email has been sent.")
        return redirect('reservation')
    
    return render(request,'core/reservation.html')

@login_required
def contact(request):
    if request.method == "POST":
        name = request.POST.get("name", "").strip()
        email = request.POST.get("email", "").strip()
        phone = request.POST.get("phone", "").strip()
        subject = request.POST.get("subject", "").strip()
        message = request.POST.get("message", "").strip()
        
        # 1. Check required fields
        if not name or not email or not subject or not message:
            messages.error(request, "Please fill in all required fields.")
            return redirect("contact")
        
        # 2. Validate email format
        try:
            validate_email(email)
        except ValidationError:
            messages.error(request,"Enter a valid email")
            return redirect('contact')
        #check duplicate email
        # if Contact.objects.filter(email=email).exists():
        #     messages.warning(request,'this email is already exist')
        #     return redirect('contact')

        Contact.objects.create(
            name=name,
            email=email,
            phone=phone,
            subject=subject,
            message=message,
        )
        # Email subject
        subject = "📩 We've Received Your Message – Suzan Momo Restaurant"
        
        # Email body
        message = render_to_string( "core/contact_email.html",{
            "name": name,
            "phone": phone,
            "email": email,
            "subject": subject,
            'message':message,},)
        
        # Sender's email address
        from_email = "suzanmomorestaurant@gmail.com"
        
        # Recipient email address
        recipient_list = [email]
        
        # Send email
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=recipient_list,
            fail_silently=False,)

        messages.success(request, "Your message has been sent successfully!")
        return redirect("contact")

    return render(request,"core/contact.html")


# ==================== CART VIEWS ====================
def get_or_create_cart(request):
    """Get or create a cart for the current session/user"""
    if request.user.is_authenticated:
        cart, created = Cart.objects.get_or_create(user=request.user)
    else:
        session_id = request.session.session_key
        if not session_id:
            request.session.create()
            session_id = request.session.session_key
        cart, created = Cart.objects.get_or_create(session_id=session_id)
    return cart


@require_POST
def add_to_cart(request):
    """Add item to cart via AJAX"""
    try:
        data = json.loads(request.body)
        menu_item_id = data.get('menu_item_id')
        quantity = int(data.get('quantity', 1))
        
        if quantity < 1:
            quantity = 1
        
        menu_item = MenuItem.objects.get(id=menu_item_id)
        cart = get_or_create_cart(request)
        
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            menu_item=menu_item,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        
        cart.save()  # Update the updated_at timestamp
        
        return JsonResponse({
            'success': True,
            'message': f'{menu_item.title} added to cart!',
            'cart_count': cart.get_total_items(),
            'total': str(cart.get_total())
        })
    except MenuItem.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Menu item not found'}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'message': 'Invalid data'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)


@require_GET
def view_cart(request):
    """Display cart page"""
    from decimal import Decimal
    
    cart = get_or_create_cart(request)
    total = cart.get_total()
    delivery = Decimal('100')  # Rs 100
    grand_total = total + delivery
    
    context = {
        'cart': cart,
        'cart_items': cart.items.all(),
        'total': total,
        'delivery': delivery,
        'grand_total': grand_total,
        'total_items': cart.get_total_items(),
    }
    return render(request, 'core/cart.html', context)


@require_POST
def update_cart_item(request):
    """Update quantity of cart item"""
    try:
        data = json.loads(request.body)
        cart_item_id = data.get('cart_item_id')
        quantity = int(data.get('quantity', 1))
        
        if quantity < 1:
            quantity = 1
        
        cart_item = CartItem.objects.get(id=cart_item_id)
        cart = get_or_create_cart(request)
        
        if cart_item.cart != cart:
            return JsonResponse({'success': False, 'message': 'Unauthorized'}, status=403)
        
        cart_item.quantity = quantity
        cart_item.save()
        cart.save()
        
        return JsonResponse({
            'success': True,
            'subtotal': str(cart_item.get_subtotal()),
            'cart_total': str(cart.get_total()),
            'cart_count': cart.get_total_items(),
        })
    except CartItem.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Cart item not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)


@require_POST
def remove_from_cart(request):
    """Remove item from cart"""
    try:
        data = json.loads(request.body)
        cart_item_id = data.get('cart_item_id')
        
        cart_item = CartItem.objects.get(id=cart_item_id)
        cart = get_or_create_cart(request)
        
        if cart_item.cart != cart:
            return JsonResponse({'success': False, 'message': 'Unauthorized'}, status=403)
        
        cart_item.delete()
        cart.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Item removed from cart',
            'cart_total': str(cart.get_total()),
            'cart_count': cart.get_total_items(),
        })
    except CartItem.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Cart item not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)


def clear_cart(request):
    """Clear all items from cart"""
    cart = get_or_create_cart(request)
    cart.items.all().delete()
    cart.save()
    
    messages.success(request, 'Cart cleared')
    return redirect('cart')
# login
def log_in(request):
    if request.method == "POST":
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '')
        remember_me = request.POST.get('checkbox')
        next_url = request.POST.get('next', '')
        
        if not User.objects.filter(username=username).exists():
            messages.error(request,"Username is not registered yet.")
        else:
            # Authenticate the user using username and password.
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)

                if remember_me:
                    request.session.set_expiry(36000)
                else:
                    request.session.set_expiry(0)

                return redirect(next_url or 'index')

            messages.error(request, "Invalid username or password.")

    # Store the requested URL so it can be preserved after a failed login.
    next_url = request.GET.get('next', request.POST.get('next', ''))
    return render(request, 'account/login.html', {'next': next_url})

# register
def register(request):
    if request.method == "POST":
        fname = request.POST.get('fname')
        lname = request.POST.get('lname')
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        cpassword = request.POST.get('cpassword')
        terms = request.POST.get('terms')
        
        if not terms:
            messages.error(request,'You must agree to the Terms of Service and Privacy Policy.')
            return redirect('log_in')
        
        if password == cpassword:
            # check username is already exist or not
            if User.objects.filter(username=username):
                messages.error(request,'username already exist')
                return redirect('log_in')
            #check email is already exist or not
            if User.objects.filter(email=email):
                messages.error(request,'email is already exist')
                return redirect('log_in')
             # Method 1: Display separate validation messages
             
            if not re.search('[A-Z]',password):
                messages.error(request,'your password must be contain at least one upper case')
                return redirect('log_in')
            if not re.search('\d',password):
                messages.error(request,'your password must be contain at least one digit')
                return redirect('log_in')
            try:
                validate_password(password)
                User.objects.create_user(
                    first_name=fname,
                    last_name=lname,
                    username=username,
                    email=email,
                    password=password
                    
                )
                messages.success(request,'register successfuly')
                return redirect('log_in')
            except ValidationError as e :
                 # Display all password validation errors
                for i in e.messages:
                    messages.error(request, i)
                    
                return redirect('log_in')
                
        else:
            messages.error(request,"password do not match")
            return redirect('log_in')
    return render(request, 'account/login.html')

# logout
def log_out(request):
    username=request.user.username if request.user.is_authenticated else 'anonymous'
    logout(request)
    
    return redirect('index')

# password change
def password_change(request):
    
    form = PasswordChangeForm(user=request.user,data = request.POST)
    if form.is_valid():
        form.save()
        return redirect('log_in')
    

    return render(request,'account/password_change.html',{'form': form})