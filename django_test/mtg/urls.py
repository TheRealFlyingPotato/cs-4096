from django.urls import path

from . import views

app_name = 'mtg'
urlpatterns = [
	path('', views.index, name='index'),
	path('create_deck/', views.create_deck, name='create_deck'),
	path('deck/<int:deck_id>/', views.deck, name='deck'),
	path('deck/<int:deck_id>/delete', views.delete, name='delete'),
	path('deck/<int:deck_id>/update', views.update, name='update'),
  	path('deck/<int:deck_id>/editor', views.editor, name='editor'),
]
