from django.contrib import admin

# User imports
from .models import Decks, Contents

# Register your models here.
admin.site.register(Decks)
admin.site.register(Contents)
