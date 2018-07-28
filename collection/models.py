from django.db import models

from shop.models import Product


# Create your models here.

class Collection(models.Model):
    title = models.CharField(max_length=140)
    slug = models.SlugField(max_length=140)

    def __str__(self):
        return self.title


class ProductCollection(models.Model):
    collection = models.ForeignKey(Collection)
    book = models.ForeignKey(Product)

    def __str__(self):
        return self.collection.title
