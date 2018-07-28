from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings


class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    profile_photo = models.ImageField(upload_to='users/%Y/%m/%d',
                                      blank=True)
    date_of_birth = models.DateTimeField(null=True, blank=True)
    phone_number = models.IntegerField(null=True, blank=True)

    def photo(self, default_path="default_user_photo.png"):
        if self.profile_photo:
            return self.profile_photo
        return default_path

    def get_absolute_url(self):
        return '/accounts/profile/'

    @property
    def full_name(self):
        return self.user.get_full_name()

    @property
    def date_joined(self):
        return self.user.date_joined

    def __str__(self):
        return '{} {}.'.format(self.user.first_name, self.user.last_name[:1])


    @receiver(post_save, sender=User)
    def create_user_profile(sender, instance, created, **kwargs):
        if created:
            Profile.objects.create(user=instance)


    @receiver(post_save, sender=User)
    def save_user_profile(sender, instance, **kwargs):
        instance.profile.save()
