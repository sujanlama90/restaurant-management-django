from .models import Cart

def cart_context(request):
    """Add cart information to all templates"""
    cart = None
    cart_count = 0
    
    if request.user.is_authenticated:
        try:
            cart = Cart.objects.get(user=request.user)
            cart_count = cart.get_total_items()
        except Cart.DoesNotExist:
            pass
    else:
        session_id = request.session.session_key
        if session_id:
            try:
                cart = Cart.objects.get(session_id=session_id)
                cart_count = cart.get_total_items()
            except Cart.DoesNotExist:
                pass
    
    return {
        'cart': cart,
        'cart_count': cart_count,
    }
