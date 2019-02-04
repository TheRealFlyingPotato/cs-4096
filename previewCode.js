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

  // $(".card").mouseover(showCard);

  $("#addBtn").on('click', function() {
    addCard($("#cardname").val());
  });

  $(document).on('keypress', function(e) {
    if(e.which == 13)
    {
      e.preventDefault();
      addCard($("#cardname").val());
    }
  })

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
  $("#cardname").val("");
  return el;
}

function getImage(name,callback) {
  return $.getJSON( "https://api.scryfall.com/cards/named?exact=" + name, function( data ) {
    console.log(data.image_uris);
    callback(data.image_uris.normal);
  });
}