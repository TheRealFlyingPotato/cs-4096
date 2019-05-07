var TESTING = false;
var deckJSON = {}
var CARDVIEWS = ["custom", "cmc", "type"]
const VIEWER_CATEGORIES = {
  custom : {},
  cmc : {},
  type : {},
};
var viewer_categories = VIEWER_CATEGORIES;

$( document ).ready(function() {
  console.log("are you really ready tho");
  $( "#outer" ).mouseover(function() {
    // $( "#log" ).append( "<div>Handler for .mouseover() called.</div>" );
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


  document.getElementById("dwn-btn").addEventListener("click", function(){
    // Generate download of deck.txt file with some content
    var text = $("#cardEntry").val();
    var filename = "deck.txt";
    
    download(filename, text);
  }, false);

  console.log("ready!");
});

function saveDeck () {
  // updateDeck();
  if (typeof deckJSON == "undefined")
  {
    console.log("\n\n\n\n!!!!!!!!!deck not previewed yet")
    return;
  } 
  saveDeckPostUrl = '/mtg/deck/' + window.location.pathname.split("/deck/")[1].split('/editor')[0] + 'update'

    var deckPOST = {};
    for (var key in deckJSON) {
	    deckPOST[key] = deckJSON[key].card_count;
      if (Array.isArray(deckJSON[key].categories)) {
        for (var i = 0; i < deckJSON[key].categories.length; i++) {
          deckPOST[key] += '*' + deckJSON[key].categories[i];
        }
      }
    }
    
  // $.post(saveDeckPostUrl,
  //   deckJSON,
  //   function (data) {console.log("YEEEEET", data)});
  $.ajax({
    'type' : 'POST',
    'url' : saveDeckPostUrl,
    'success' : function(result) {console.log("Post success!: ", saveDeckPostUrl)},
    'data' : deckPOST
  });
  $("#alertLoc").html("<div class=\"alert alert-success\" role=\"alert\">Deck saved successfully!</div>")
  setTimeout(() => {$(".alert").alert("close");},2000)
  //$(".alert").alert()
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

function isDigit(n) {
  return Boolean([true, true, true, true, true, true, true, true, true, true][n]);
}

function isManaSymbol(c) {
  return c.toUpperCase() in {"W": "", "U": "", "B": "", "R": "", "G": ""}
}

function convertToCMC(s)
{
  var count = 0;
  for (i = 0; i < s.length; i++)
  {
    if (s[i] == '{' || s[i] == "}")
      continue;
    if (isManaSymbol(s[i]))
      count += 1
    else if (isDigit(s[i]))
      count += parseInt(s[i], 10)
    // console.log(i, ":", s[i])
  }
  return count
}

const DASH = "—";
function getTypes(s) {
  var l = s.split(" ")
  var res = []
  var keepGoing = true;
  while(true)
  {
    if (l.length == 0)
      break;
    if (l[0] == DASH)
      break;
    if (l[0] == "-")
      break;
    if (l[0] == "Legendary" || l[0] == "Basic")
    {
      l.shift();
      continue;
    }
    res.push(l.shift());
  }
  console.log("getTypes: ", res);
  return res;
}

function buildCardListRecursive(list, obj, callback) {
  c = list.pop();
  card = c.split('*');
  // console.log("x: ", card)
  cardCount = 1; // assume only 1 card
  cardName = card[0].trim()
  // console.log("wee: ", isDigit(cardName[0]))
  if (isDigit(cardName[0])) {
    // first symbol of the card is a number
    q = cardName.split(" ");
    // console.log("ree: ", q);
    cardCount = q.shift();
    if (cardCount[cardCount.length-1 == 'x'])
    cardCount = cardCount.slice(0, cardCount.length - 1);
    cardCount = parseInt(cardCount);
    cardName = q.join(" ");
    // console.log("reeq:", cardName, cardCount);
  }
  // console.log("::", cardName);
  //if (cardCount > 1)
  //  while (cardName[0] != ' ')
 //     cardName = cardName.slice(1, cardName.length)
  // console.log("::", cardName);

  
  getJSONforCard(cardName.trim(), function(data) {
    if (data != null)
    {
      obj[data.name] = {
            'categories': [],
            'legalities' : data.legalities,
            'mana_cost' : data.mana_cost,
            'image' : data.image_uris.normal,
            'types' : getTypes(data.type_line),
            'card_count' : cardCount,
            'cmc' : convertToCMC(data.mana_cost)
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
  console.log("l--------------", cardInfoList);
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


// ******************************************************** //
//      puts the cards in the viewer categories object      //
//      no visual changes made in this function             //
// ******************************************************** //

function addToCategory(name, cat = "Other", type = "custom") 
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
  for (key in viewer_categories)
  {
    viewer_categories[key] = {};
  }
  // viewer_categories = VIEWER_CATEGORIES;
  deckJSON = {};
  callback();
}

function updateDeck() {
  resetDeckList(() => {
  buildCardDataFromString($("#cardEntry").val(), (json) => {

      deckJSON = json;
      console.log("alpha", JSON.stringify(viewer_categories));
      // console.log("omega:", deckJSON, JSON.stringify(deckJSON));
      for (var card in deckJSON) 
      {
        // adding to custom
        if (deckJSON[card].categories.length == 0)
          addToCategory(card);
        else
          deckJSON[card].categories.forEach(function(cat) {
            addToCategory(card, cat);
          });
        // adding to CMC
        addToCategory(card, deckJSON[card]["cmc"], "cmc")
        // adding to card types
          deckJSON[card].types.forEach((t) => {
            addToCategory(card, t, "type")
          });

      }
      console.log(deckJSON)

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
      var catContainer = buildCategoryElement(cat, catType);
      for(var i in viewer_categories[catType][cat])
      {
        // console.log(cat + ":" + viewer_categories[catType][cat][i]);
        var name = viewer_categories[catType][cat][i]
        if (deckJSON[name]) {
          buildCardElement(catContainer, name, deckJSON[name]["card_count"]);
        }
      }
    }
  });
}

function buildCategoryElement(cat, whichCat) 
{
  console.log("------------------Q:", cat, whichCat)
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


function buildCardElement(container, name, count=1)
{
  // console.log("building: " + name);
  var el = document.createElement("a");
  el.innerHTML = "<b>" + count + "</b> " + name + "<br/>";
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

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

// Start file download.
function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

