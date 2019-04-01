from django.db import models

# Create your models here.
class Decks(models.Model):
	name = models.CharField(max_length=64)
	notes = models.CharField(max_length=256)
	deck_format = models.CharField(max_length=64)

	def __str__(self):
		return self.name


class Contents(models.Model):
	deck_id = models.ForeignKey(Decks, on_delete=models.CASCADE)
	card_name = models.CharField(max_length=128)
	count = models.IntegerField(default=1)
	# categories = models.CharField(max_length=128)

	def __str__(self):
		return "{}x {}".format(self.count, self.card_name)

# class Categories(models.Model):
# 	deck_id = models.ForeignKey(Decks, on_delete=models.CASCADE)
# 	card_id = models.ForeignKey(Contents, on_delete=models.CASCADE)
# 	category_name = models.CharField(max_length=64)

# 	def __str__(self):
# 		return self.category_name
