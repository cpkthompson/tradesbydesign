from django import forms
from django.utils.translation import ugettext_lazy as _

from .models import Order


class OrderCreateForm(forms.ModelForm):
    # pass
    class Meta:
        model = Order
        fields = ['address', 'phone_number']

        labels = {
            'address': _('Delivery Address'),
            'phone_number': _('Phone Number'),
        }
        widgets = {
            'address': forms.Textarea(
                attrs={'class': 'textarea', 'placeholder': 'House No. 1384, Kwame Nkrumah Avenue, Accra',
                       'type': 'address'}),
            'phone_number': forms.NumberInput(attrs={'class': 'input', 'placeholder': '0203456060'}),
        }
