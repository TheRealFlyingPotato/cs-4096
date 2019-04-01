from django.urls import path

from . import views

app_name = 'mtg'
urlpatterns = [
	path('', views.index, name='index'),
	path('create_deck/', views.create_deck, name='create_deck'),
	path('deck/<int:deck_id>/', views.deck, name='deck'),
	path('deck/<int:deck_id>/add', views.add, name='add'),
  	path('deck/<int:deck_id>/editor', views.editor, name='editor'),
]
