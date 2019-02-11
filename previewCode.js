var TESTING = true;

$( document ).ready(function() {
  $( "#outer" ).mouseover(function() {
    $( "#log" ).append( "<div>Handler for .mouseover() called.</div>" );
  });

  $("#addBtn").on('click', function() {
    transferToMaindeck();
  });

  $("#updateDeck").on('click', updateDeck);

  $(document).on('keypress', function(e) {
    if(e.which == 13 && document.activeElement == $("#cardname")[0])
    {
      // if (document.activeElement == $("#cardname")[0])
      // {
        e.preventDefault(); // ignores form submission
        transferToMaindeck();
      // }

    }
  })

  // setInterval(checkPageFocus, 300);

  if (TESTING) {
    $("#cardEntry").val("Cancel\nWhisper, Blood Liturgist *CMDR");
  }

  console.log("ready!");
});

function transferToMaindeck(){
  var newName = $("#cardname").val().trim();
  if (newName == "")
  {
    console.log("no card given");
    return;
  }
  $("#cardEntry").val($("#cardEntry").val() + "\n" + newName)
  $("#cardname").val("");
}

function addCard(text) {
  var el = document.createElement("a");
  el.innerHTML = text + "<br/>";
  getImageUrl(text, function(imgSrc) {
    $(el).popover({
      trigger: "hover",
      html: true,
      content: '<a class="imgContainer"><img src="' + imgSrc + '" /></a>'
    });  
  });
  $("#cardList").append(el);
  return el;
}

function getImageUrl(name,callback) {
  return $.getJSON( "https://api.scryfall.com/cards/named?exact=" + name, function( data ) {
    callback(data.image_uris.normal);
  });
}

function cardsToObject(s) {
  var listLines = s.split('\n');
  var dict = {};
  listLines.forEach(function(el) {
    var card = el.split('*')
    var tmp = []
    for (i = 0; i < card.length; i++) {
      if (i != 0)
      {
        tmp.push(card[i].trim());
      } 
    }
    dict[card[0].trim()] = tmp;
  });
  return dict;
}

function updateDeck() {
  $("#cardList")[0].innerHTML = "";
  var cards = cardsToObject($("#cardEntry").val().trim())
  for (card in cards) {
    addCard(card);
  }
}