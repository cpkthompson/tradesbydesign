from django import forms
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse_lazy
from django.forms import ModelForm, Textarea, DateInput, TextInput, Select, EmailInput, RadioSelect, FileInput, \
    SelectMultiple
from django.utils.translation import ugettext_lazy as _
from .models import *


class SignupForm(forms.Form):
    first_name = forms.CharField(max_length=30, required=True)
    last_name = forms.CharField(max_length=30, required=True)

    field_order = [
        'first_name',
        'last_name',
        'email',
    ]

    def signup(self, request, user):
        user.first_name = self.cleaned_data['first_name']
        user.last_name = self.cleaned_data['last_name']
        user.save()

class UserEditForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email',)
        widgets = {
            'first_name': TextInput(attrs={'class': 'input', }),
            'last_name': TextInput(attrs={'class': 'input', }),
            'email': EmailInput(attrs={'class': 'input', 'type': 'email'}),
        }

    def __init__(self, *args, **kwargs):
        super(UserEditForm, self).__init__(*args, **kwargs)
        self.fields['first_name'].required = True
        self.fields['last_name'].required = True


class ProfileEditForm(forms.ModelForm):
    class Meta:
        model = Profile
        exclude = ('user',)
        widgets = {
            'profile_photo': FileInput(attrs={'class': 'file-input', }),
        }
