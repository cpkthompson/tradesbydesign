from django.shortcuts import render, reverse
from django.contrib.auth.decorators import login_required

# Create your views here.
@login_required
def profile(request):
    return render(request, 'accounts/profile.html', {})
