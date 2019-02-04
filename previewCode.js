// $(".card").mouseover(function () {
//   console.log(this)
// });

$( "#outer" ).mouseover(function() {
  $( "#log" ).append( "<div>Handler for .mouseover() called.</div>" );
});

$( document ).ready(function() {
  $( "#outer" ).mouseover(function() {
    $( "#log" ).append( "<div>Handler for .mouseover() called.</div>" );
  });

  $(".card").mouseover(showCard);

  // imgSrc = 'https://img.scryfall.com/cards/large/en/m19/225.jpg?1531451238'
  // $('[data-toggle="popover"]').popover(
  //   {
  //     trigger: "hover",
  //     html: true,
  //     content: '<div class="imgContainer"><img src="' + imgSrc + '" /></div>'
  //   });   

  console.log( "ready!" );
});

function showCard(e) {
  console.log(e.target.innerText);
}

function addCard(text) {
  var el = document.createElement("a");
  el.innerHTML = text + "<br/>";
  getImage(text, function(imgSrc) {
    $(el).popover({
      trigger: "hover",
      html: true,
      content: '<a class="imgContainer"><img src="' + imgSrc + '" /></a>'
    });  
  });
  $("#cardList").append(el);
  return el;
}

function getImage(name,callback) {
  return $.getJSON( "https://api.scryfall.com/cards/named?exact=" + name, function( data ) {
    console.log(data.image_uris);
    callback(data.image_uris.normal);
  });
}