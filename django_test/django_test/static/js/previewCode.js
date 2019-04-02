var TESTING = false;
var CARDVIEWS = ["custom"]

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
      e.preventDefault(); // ignores form submission
      transferToMaindeck();
    }
  })

  if (TESTING) {
    $("#cardEntry").val("Cancel*Control *Instant\nWhisper, Blood Liturgist *CMDR\nMystic Confluence *Control*Instant*Draw \nGenerous Stray");
    $("#test").on('click', function(){
      buildCardDataFromString($("#cardEntry").val());
    });
  }
  else
  {
    $("#test").toggle();
  }


  idens = {
    "identifiers": [
      {
        "id": "683a5707-cddb-494d-9b41-51b4584ded69"
      },
      {
        "name": "Ancient Tomb"
      },
      {
        "set": "mrd",
        "collector_number": "150"
      }
    ]
  }

  $("#saveDeck").on('click', saveDeck);
  // $.post("https://api.scryfall.com/cards/collection", 
  //   idens, 
  //   function(data) {
	//     console.log(data);
  // });

  console.log("ready!");
});

function saveDeck () {
  if (typeof deckJSON == "undefined")
  {
    console.log("deck not previewed yet")
    return;
  } 
  saveDeckPostUrl = '/mtg/deck/' + window.location.pathname.split("/deck/")[1].split('/editor')[0] + '/update'
  $.post(saveDeckPostUrl,
    deckJSON,
    function (data) {console.log("YEEEEET", data)});
}


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

function getImageUrl(name) {
  try
  {
    return deckJSON[name].image;
  }
  catch(err) {
    console.log(err.message, name)
  }
}

function getJSONforCard(name, callback) {
  if (name == "")
  {
    callback(null);
    return;
  }
  return $.getJSON( "https://api.scryfall.com/cards/named?exact=" + name, function( data ) {
    callback(data);
  });
}

function buildCardListRecursive(list, obj, callback) {
  c = list.pop();
  card = c.split('*');
  getJSONforCard(card[0].trim(), function(data) {
    if (data != null)
    {
      obj[data.name] = {
            'categories': [],
            'legalities' : data.legalities,
            'mana_cost' : data.mana_cost,
            'image' : data.image_uris.normal,
            'type_lines' : data.type_line
      };
      for (i = 1; i < card.length; i++)
      {
        obj[data.name].categories.push(card[i].trim());
      }
    }
    if (list.length > 0)
    {
      buildCardListRecursive(list, obj, callback);
    }
    else
    {
      callback(obj);
    }
  });

}

function buildCardDataFromString(s, callback) {
  var cardInfoList = s.split('\n');
  // console.log("l--------------")
  // console.log(cardInfoList);
  var finalJSON = {};
  buildCardListRecursive(cardInfoList, finalJSON, () => {
    callback(finalJSON);
  });
  // get card categories
  // cardInfoList.forEach(function (c) {
  //   var card = c.split('*');
  //   getJSONforCard(card[0].trim(), function(data) {
  //     finalJSON[data.name] = {
  //         'categories': [],
  //         'legalities' : data.legalities,
  //         'mana_cost' : data.mana_cost,
  //         // 'image' : data.image_uris.normal,
  //         'type_lines' : data.type_line
  //     };
  //     for (i = 1; i < card.length; i++)
  //     {
  //       finalJSON[data.name].categories.push(card[i].trim());
  //     }
  //   });
  // });
  callback(finalJSON);
  return finalJSON;
  // getJSONforCard()
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

const VIEWER_CATEGORIES = {
  custom : {}
};
viewer_categories = VIEWER_CATEGORIES;


// ******************************************************** //
//      puts the cards in the viewer categories object      //
//      no visual changes made in this function             //
// ******************************************************** //

function addToCategory(name, cat = "Other", num = 1, type = "custom") 
{
  if (cat in viewer_categories[type])
  {
    viewer_categories[type][cat].push(name);
  }
  else
  {
    viewer_categories[type][cat] = [name];
  }
}

function resetDeckList(callback) {
  CARDVIEWS.forEach((name) =>{
    $("#cardview-" + name).empty();
  });
  viewer_categories = VIEWER_CATEGORIES;
  deckJSON = {}
  callback();
}

function updateDeck() {
  resetDeckList(() => {
  buildCardDataFromString($("#cardEntry").val(), (json) => {
      deckJSON = json;
      console.log("omega:", deckJSON, JSON.stringify(deckJSON));
      for (var key in deckJSON) 
      {
        if (deckJSON[key].categories.length == 0)
          addToCategory(key);
        else
          deckJSON[key].categories.forEach(function(cat) {
            addToCategory(key, cat);
          });
      }

      updatePreview();
    });
  });
}

function updatePreview() {
  //console.log("deckJSON: ", JSON.stringify(deckJSON))
  if (Object.keys(deckJSON).length == 0)
    return;
  CARDVIEWS.forEach((catType) =>
  {
    console.log("building cardview-" + catType)
    //console.log("update preview: ", JSON.stringify(viewer_categories))
    for(var cat in viewer_categories[catType])
    {
      var catContainer = buildCategoryElement(cat, "custom");
      for(var i in viewer_categories[catType][cat])
      {
        // console.log(cat + ":" + viewer_categories[catType][cat][i]);
        buildCardElement(catContainer, viewer_categories[catType][cat][i]);
      }
    }
  });
}

function buildCategoryElement(cat, whichCat) 
{
  var el = document.createElement("div");
  el.setAttribute("id", "cat-" + cat);
  el.innerHTML = "<h4>" + cat + "</h4>";
  $("#cardview-" + whichCat).append(el);
  return el;
}

// **************************************************** //
// Fixes the bootstrap popover being placed in          //
// wrong initial position by preloading the image       //
// **************************************************** //
function preloadImage(url) {
  var img = new Image();
  img.src = url;
}


function buildCardElement(container, name)
{
  // console.log("building: " + name);
  var el = document.createElement("a");
  el.innerHTML = name + "<br/>";
  var imgSrc = getImageUrl(name);
  $(el).popover({
      trigger: "hover",
      html: true,
      content: '<a class="imgContainer"><img src="' + imgSrc + '" /></a>'
    });
  preloadImage(imgSrc);
  container.append(el);
  return el;
}

