from django.contrib import admin
from .models import Profile


class ProfileAdmin(admin.ModelAdmin):
	list_display = ['full_name', 'user', 'date_joined']
	# list_editable = ('is_approved',)
	list_filter = ()

	exclude = ['profile_photo']


admin.site.register(Profile, ProfileAdmin)
