from django.conf import settings
from django.core.urlresolvers import reverse
from django.db import models
from django.template.defaultfilters import slugify


# from collection.models import Collection, BookCollection

class MerchType(models.Model):
    name = models.CharField(max_length=200, db_index=True)
    is_active = models.BooleanField(default=True)


class Merch(models.Model):
    category = models.ForeignKey(MerchType, related_name='products')
    title = models.CharField(max_length=200, db_index=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='writer', blank=True, null=True)
    slug = models.SlugField(max_length=200, db_index=True)
    image = models.ImageField(upload_to='products/%Y/%m/%d', blank=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField()
    available = models.BooleanField(default=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-created',)
        index_together = (('id', 'slug'),)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self._state.adding:
            self.slug = slugify("%s by %s" % (self.title, self.owner))
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse('merch:product_detail', args=[self.slug])

# Create your models here.
