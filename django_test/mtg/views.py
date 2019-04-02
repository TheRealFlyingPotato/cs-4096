from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404, render
from django.urls import reverse

from .models import Decks, Contents

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

def update(request, deck_id):
	deck = get_object_or_404(Decks, id=deck_id)
	try:
		count = int(request.POST['count'])
		card_names = []
		card_count = []
		for i in range(count):
			# Get and save cards
			card_names.append(request.POST['cn{}'.format(i)])
			card_count.append(int(request.POST['cc{}'.format(i)]))
	except KeyError:
		context = {
			'deck': deck,
			'error_message': 'There was a problem while saving',
		}
		return render(request, 'mtg/deck.html', context)

	for i in range(count):
		try:
			selected_card = deck.contents_set.get(card_name=card_names[i])
			selected_card.count += card_count[i]
			# TODO: limit cards here?
			selected_card.save()
		except Decks.DoesNotExist:
			deck.contents_set.create(card_name=card_names[i], 
									 count=card_count[i])
			deck.save()

	return HttpResponseRedirect(reverse('mtg:deck', args=(deck.id,)))
