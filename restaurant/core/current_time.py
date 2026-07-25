from datetime import datetime

def current(request):
    return {'date':datetime.now()}