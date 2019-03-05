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



// function getImageUrl(name,callback) {
//   return $.getJSON( "https://api.scryfall.com/cards/named?exact=" + name, function( data ) {
//     callback(data.image_uris.normal);
//   });
// }

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
  return $.getJSON( "https://api.scryfall.com/cards/named?exact=" + name, function( data ) {
    callback(data);
  });
}

function buildCardListRecursive(list, obj, callback) {
  c = list.pop();
  card = c.split('*');
  getJSONforCard(card[0].trim(), function(data) {
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

function addToCategory(name, cat = "Other", num = 1, type = "custom") {
  // console.log(viewer_categories[type])
  // for (x in viewer_categories[type])
    // console.log(x);
  if (cat in viewer_categories[type])
  {
    // console.log("Category exists: " + cat);
    viewer_categories[type][cat].push(name);
  }
  else
  {
    // console.log("Creating category: " + cat);
    viewer_categories[type][cat] = [name];
  }
  //viewer_categories[cat].push
  // $("#cardList").append("<div id='cat-" + s + "' class='category'><h4>" + s + "</h4></div>");
}

function categoryExists(s) {
  // return document.getElementById("cat-" + s) != null;
}


function resetDeckList(callback) {
  $("#cardList").empty();
  viewer_categories = VIEWER_CATEGORIES;
  deckJSON = {}
  callback();
}

function updateDeck() {
  // console.log("I'm sorry what")
  // viewer_categories = VIEWER_CATEGORIES;
  // $("#cardList").empty();
  resetDeckList(() => {
  buildCardDataFromString($("#cardEntry").val(), (json) => {
      deckJSON = json;
      console.log("omega:", JSON.stringify(deckJSON));
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
  console.log("deckJSON: ", JSON.stringify(deckJSON))
  if (Object.keys(deckJSON).length == 0)
    return;
  var catType = 'custom'
  console.log("update preview: ", JSON.stringify(viewer_categories))
  for(var cat in viewer_categories[catType])
  {
    var catContainer = buildCategoryElement(cat);
    for(var i in viewer_categories[catType][cat])
    {
      // console.log(cat + ":" + viewer_categories[catType][cat][i]);
      buildCardElement(catContainer, viewer_categories[catType][cat][i]);
    }
  }
}

function buildCategoryElement(cat) 
{
  var el = document.createElement("div");
  el.setAttribute("id", "cat-" + cat);
  el.innerHTML = "<h4>" + cat + "</h4>";
  $("#cardList").append(el);
  return el;
}

// **************************************************** //
// Fixes the bootstrap popover being placed in
// wrong initial position by preloading the images
// **************************************************** //
function preloadImage(url) {
  // console.log("preloadImage: "+url);
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
// });
  // getImageUrl(text, function(imgSrc) {
  //   $(el).popover({
  //     trigger: "hover",
  //     html: true,
  //     content: '<a class="imgContainer"><img src="' + imgSrc + '" /></a>'
  //   });
  // });

//   console.log("object", deckJSON);
//   // while(!Object.keys(deckJSON).length)
//   //   console.log(0);
//   // console.log(deckJSON.Cancel)
//   $.each($.parseJSON(data), function (key, value) {
//     alert(value.<propertyname>);
// });
  // console.log("t1:", JSON.parse(JSON.stringify(Object.keys(deckJSON))));
  // console.log("t2:", Object.getOwnPropertyNames(deckJSON));
  // addCategory("Other");
  // Object.keys(deckJSON).forEach(function(key) {
  //   addCard(key);
  //   // console.log(key)
  //   // deckJSON[key].categories.forEach(function(cat) {
  //   //   console.log(cat);
  //   // })
  //   // if(!categoryExists())

  // });

