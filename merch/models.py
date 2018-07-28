# from categories.models import Category
from categories.models import Category
from django.conf import settings
from django.core.urlresolvers import reverse
from django.db import models
from django.template.defaultfilters import slugify


class Merch(models.Model):
    type = models.ForeignKey(Category, related_name='merch', null=True, blank=True)
    name = models.CharField(max_length=200, db_index=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='seller', blank=True, null=True)
    slug = models.SlugField(max_length=300, db_index=True, editable=False)
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
        verbose_name_plural = 'Merch'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self._state.adding:
            self.slug = slugify("%s by %s" % (self.name, self.owner))
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse('merch:merch_detail', args=[self.slug])
