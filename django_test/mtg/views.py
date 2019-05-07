from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404, render
from django.urls import reverse

from .models import Decks, Contents

from django.views.decorators.csrf import csrf_exempt

# Create your views here.
def index(request):
	context = {'deck_list': Decks.objects.order_by('-name')}
	return render(request, 'mtg/index.html', context)

def create_deck(request):
	try:
		deck_name = request.POST['name']
		deck_notes = request.POST['description']
		deck_format = request.POST['format']
	except KeyError:
		context = {
			'error_message': 'The was a problem creating the deck.',
		}
		return render(request, 'mtg/index.html', context)
	new_deck = Decks(name=deck_name, notes=deck_notes, deck_format=deck_format)
	new_deck.save()
	return HttpResponseRedirect(reverse('mtg:index'))

def deck(request, deck_id):
	# deck = get_object_or_404(Decks, id=deck_id)
	# context = {
	# 	'deck': deck,
	# 	'cards': deck.contents_set.all(),
	# }
	# return render(request, 'mtg/deck.html', context)
	return editor(request, deck_id)

def editor(request, deck_id):
	deck = get_object_or_404(Decks, id=deck_id)
	context = {
		'deck': deck,
		'cards': deck.contents_set.all(),
	}
	return render(request, 'mtg/editor.html', context)

@csrf_exempt
def update(request, deck_id):
	deck = get_object_or_404(Decks, id=deck_id)

	for card, count in request.POST.items():
		print('{}: {}'.format(card, count))
		try:
			tmp = deck.contents_set.get(card_name=card)
			categories = count.split('*')
			tmp.count = int(categories[0])
			tmp.categories = ''
			for category in categories[1:]:
				tmp.categories += '*' + category.strip() + ' '
			tmp.save()
		except (Decks.DoesNotExist, Contents.DoesNotExist):
			categories = count.split('*')
			categories_as_str = ''
			for category in categories[1:]:
				categories_as_str += '*' + category.strip() + ' '
			deck.contents_set.create(card_name=card, count=int(categories[0]))
			deck.save()

	return HttpResponseRedirect(reverse('mtg:deck', args=(deck.id,)))
