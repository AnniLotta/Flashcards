const $$ = Dom7;


const app = new Framework7({
  name: 'My App', // App name
  theme: 'auto', // Automatic theme detection
  el: '#app', // App root element
  // App store
  store: store,
  // App routes
  routes: routes,

});

var mainView = app.views.create('.view-main');

function dataToJson(formIdName) {
  const formData = app.form.convertToData(formIdName);
  const jsonString = JSON.stringify(formData);
  const jsonObject = JSON.parse(jsonString);

  return jsonObject;
}

function goHome() {
  document.location.href = './index.html';
}

//Methods for decks//

function addDeck(deckJson) {
  if (useFirebase) addDeckToDatabase(deckJson);
  else {
    addNewDeckLocal(deckJson);
    goHome();
  }
}

function getDecks(deckList) {
  if (useFirebase) getDecksDatabase(deckList);
  else {
    getDecksLocal(deckList);
  }
}

function getDeckHTML(id, name, description) {
  return `<div class="card block block-strong inset display-flex row">
      <div class="col-70 margin-left get-cards" data-deck-id="${id}">
          <p><b>${name}</b></p>
          <p>${description}</p>
      </div>
      <div class="col-30">
          <a href="/card-list/${id}/" class="get-cards" data-deck-id="${id}"><i class="icon f7-icons float-right margin-right padding-top">eyeglasses</i></a>
      </div>
  </div>`;
}

$$(document).on("click", ".add-deck", function () {
  const deckJson = dataToJson("#deck-info");
  addDeck(deckJson);
  const deckList = document.getElementById('deck-list');
  getDecks(deckList);
});

$$(document).on("click", ".delete-deck", function () {
  const deckJson = dataToJson("#edit-deck-form");
  if (useFirebase) {
    db.collection("decks").doc(deckJson.key).delete().then(() => {
      for (let i = 0; i < allCardsInDB.length; i++) {
        if (allCardsInDB[i].deck === deckJson.key) deleteCard(allCardsInDB[i].id);
      }
      console.log("Deck successfully deleted!");
      goHome();
    }).catch((error) => {
      console.error("Error removing deck: ", error);
    });
  }
  else {
    localStorage.removeItem(deckJson.key);
    goHome();
  }
});

$$(document).on("click", ".get-deck-details", function () {
  let deckId = $$(this).data("deck-id");
  let result = '';
  if (useFirebase) {
    const docRef = db.collection("decks").doc(deckId);
    docRef.get().then((doc) => {
      if (doc.exists) {
        result = doc.data();
      }
    }).catch((error) => {
      console.log("Error getting deck:", error);
    });
  }
  else result = JSON.parse(localStorage.getItem(deckId));

  $$(document).on("page:afterin", '.page[data-name="edit-deck"]', function () {
    setDeckData(result, deckId);
  });
});

$$(document).on("click", ".edit-deck", function () {
  const deckJson = dataToJson("#edit-deck-form");
  if (useFirebase) {
    db.collection("decks").doc(deckJson.key).update({
      name: deckJson.name,
      description: deckJson.description
    })
      .then(() => {
        console.log("Deck successfully updated!");
      })
      .catch((error) => {
        console.error("Error updating deck: ", error);
      });
  }
  else localStorage.setItem(deckJson.key, JSON.stringify(deckJson));
  document.getElementById('deck-title').innerHTML = deckJson.name;
});

//Set deck data on deck edit page
function setDeckData(deckJson, deckId) {
  document.getElementById("deck-name").value = deckJson.name;
  document.getElementById("deck-description").value = deckJson.description;
  document.getElementById("deck-id").value = deckId;
}

//Methods for cards//

function getMarkedCards(cards) {
  let result = [];
  for (let i = 0; i < cards.length; i++) {
    if (cards[i].marked) {
      result.push(cards[i]);
    }
  }
  return result;
}

function anyMarkedCards(cards) {
  let result = false;
  let cardsToCheck = cards;
  if (!useFirebase) {
    cardsToCheck = getCardsOfCurrentDeckLocal();
  }
  cardsToCheck.forEach((card) => {
    if (card.marked) {
      result = true;
    }
  });
  return result;
}

function getCardHTML(id, side1, side2, starIcon, marked) {
  return `<div class="card block block-strong inset display-flex row">
       <a class="col-10 padding-top margin-left toggle-mark" data-card-id="${id}"><i class="icon f7-icons color-yellow" id="${starIcon}">${marked ? 'star_fill' : 'star'}</i></a>
       <div class="col-70 margin-left">
           <p><b>${side1}</b></p>
           <p>${side2}</p>
       </div>
       <div class="col-20">
           <div class="row margin-top">
               <a class="get-card-details col-50" href="/edit-card/" data-card-id="${id}"><i class="icon f7-icons float-right margin-right">pencil</i></a>
               <a onclick="deleteCard()" class="delete-card col-50" data-card-id="${id}"><i class="icon f7-icons color-red float-right margin-right">bin_xmark_fill</i></a>
           </div>
       </div>
   </div>`;
}

$$(document).on("click", ".add-card", function () {
  const cardJson = dataToJson("#card-info");
  addCard(cardJson);
  const cardList = document.getElementById('card-list');
  getCards(cardList);
});

function addCard(cardJson) {
  const img1 = document.getElementById("add-side1photo");
  const img2 = document.getElementById("add-side2photo");
  if (useFirebase) {
    addCardToDatabase(cardJson, img1, img2);
  } else addCardLocal(cardJson, img1, img2);
}

function deleteCard(cardToDelete) {
  $$(document).on("click", ".delete-card", function () {
    let cardId = cardToDelete || $$(this).data("card-id");
    if (useFirebase) {
      for (let i = 0; i < allCardsInDB.length; i++) {
        if (allCardsInDB[i].id === cardId) {
          if (allCardsInDB[i].img1) firebase.storage().ref('cards/' + cardId + '1.jpg').delete()
          if (allCardsInDB[i].img2) firebase.storage().ref('cards/' + cardId + '2.jpg').delete()
          break;
        }
      }

      db.collection("cards").doc(cardId).delete().then(() => {
        console.log("Card successfully deleted!");
      }).catch((error) => {
        console.error("Error removing card: ", error);
      });
    }
    else localStorage.removeItem(cardId);
    const element = document.getElementById("card-list");
    getCards(element)
  });
}

$$(document).on("click", ".get-cards", function () {
  let deckId = $$(this).data("deck-id");
  $$(document).on("page:init", '.page[data-name="card-list"]', function () {
    const element = document.getElementById("card-list");
    getCards(element, deckId);
  });
});

function getCards(element, deckId) {
  if (useFirebase) getCardsDatabase(element, deckId);
  else getCardsLocal(element, deckId);
}

$$(document).on("click", ".edit-card", function () {
  const cardJson = dataToJson("#edit-card-form");
  const side1img = document.getElementById("edit-side1photo");
  const side2img = document.getElementById("edit-side2photo");
  if (useFirebase) {
    updateCardDB(cardJson, side1img, side2img);
  }
  else {
    const cardData = JSON.parse(localStorage.getItem(cardJson.key));
    cardData.side1 = cardJson.side1;
    cardData.side2 = cardJson.side2;
    localStorage.setItem(cardJson.key, JSON.stringify(cardData));
    const img1data = cardData.img1;
    const img2data = cardData.img2;
    if (side1img.style.display !== "none") {
      imageToLocalStorage(img1data, side1img);
    }
    if (side2img.style.display !== "none") {
      imageToLocalStorage(img2data, side2img);
    }
  }
});

let photo1Seleced = false;
let photo2Seleced = false;
//Select photo for a card
function selectPhoto(number, page) {
  try {
    const options = {
      quality: 50,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      encodingType: Camera.EncodingType.JPEG,
      mediaType: Camera.MediaType.PICTURE,
      allowEdit: false,
      correctOrientation: true,
    };
    navigator.camera.getPicture(
      function cameraSuccess(img) {
        if (number === 1) photo1Selected = true;
        else photo2Selected = true;
        const elementId = page + "-side" + number + "photo";
        let element = document.getElementById(elementId);
        element.src = "data:image/jpeg;base64," + img;
        element.style.display = "block";
      },
      function cameraError(error) {
        console.debug("Unable to take picture: " + error, "app");
      },
      options
    );
  }
  catch {
    console.error("Something went wrong.");
  }
};

//Set card data on card edit page
function setCardData(cardJson, cardId) {
  document.getElementById("card-side1").value = cardJson.side1;
  document.getElementById("card-side2").value = cardJson.side2;
  document.getElementById("card-id").value = cardId;
  const img1 = document.getElementById("edit-side1photo");
  const img2 = document.getElementById("edit-side2photo");
  img1.src = '';
  img2.src = '';
  img1.style.display = "none"
  img2.style.display = "none"
  if (useFirebase) {
    if (cardJson.img1) {
      getImage(cardId + '1', img1);
      img1.style.display = "block";
    }
    if (cardJson.img2) {
      getImage(cardId + '2', img2);
      img2.style.display = "block";
    }
  }
  else {
    if (cardJson.img1 !== '') {
      img1.src = localStorage.getItem(cardJson.img1);
      img1.style.display = "block";
    }
    if (cardJson.img2 !== '') {
      img2.src = localStorage.getItem(cardJson.img2);
      img2.style.display = "block";
    }
  }
}

$$(document).on("click", ".get-card-details", function () {
  let cardId = $$(this).data("card-id");
  let cardJson = '';
  if (useFirebase) {
    const docRef = db.collection("cards").doc(cardId);
    docRef.get().then((doc) => {
      if (doc.exists) {
        cardJson = doc.data();
        setCardData(cardJson, cardId);
      }
    }).catch((error) => {
      console.log("Error getting card:", error);
    });
  }
  else {
    cardJson = JSON.parse(localStorage.getItem(cardId));
    $$(document).on("page:afterin", '.page[data-name="edit-card"]', function () {
      setCardData(cardJson, cardId);
    });
  }
});

function emptyPhotos() {
  document.getElementById("edit-side1photo").style.display = 'none';
  document.getElementById("edit-side1photo").src = "";
  document.getElementById("edit-side2photo").style.display = 'none';
  document.getElementById("edit-side2photo").src = "";
}

$$(document).on("click", ".toggle-mark", function () {
  const cardId = $$(this).data("card-id");
  let starIcon = document.getElementById("mark-iconcard" + cardId);
  console.log("mark-iconcard" + cardId)
  if (useFirebase) {
    toggleMarkDatabase(cardId, starIcon);
  } else {
    starIcon = document.getElementById("mark-icon" + cardId);
    toggleMarkLocal(cardId, starIcon);
  }
});

//Methods for card review//

let cardsToReview = []
let currentCard = 0;
let side1showing = true;

function setPhotos(cardId) {
  const imgElement1 = document.getElementById("side1photo");
  const imgElement2 = document.getElementById("side2photo");
  imgElement1.style.display = "none";
  imgElement2.style.display = "none";
  if (useFirebase) {
    for (let i = 0; i < allCardsInDB.length; i++) {
      if (allCardsInDB[i].id === cardId) {
        if (allCardsInDB[i].img1) getImage(cardId + '1', imgElement1)
        if (allCardsInDB[i].img2) getImage(cardId + '2', imgElement2)
        break;
      }
    }
  } else {
    const img1 = localStorage.getItem(cardsToReview[currentCard].img1);
    const img2 = localStorage.getItem(cardsToReview[currentCard].img2);
    if (img1) {
      imgElement1.src = img1;
      imgElement1.style.display = "block";
    }
    if (img2) {
      imgElement2.src = img2;
      imgElement2.style.display = "block";
    }
  }
}

$$(document).on("click", ".start_review", function () {
  const markedCards = $$(this).data("marked-cards");
  if (useFirebase) {
    cardsToReview = getCardsOfCurrentDeckDB();
    setDeckTitle("review-title")
  } else {
    cardsToReview = getCardsOfCurrentDeckLocal();
    document.getElementById("review-title").innerText = 'Review ' + JSON.parse(localStorage.getItem(currentDeckId)).name;
  }

  const side1title = document.getElementById("side1title");
  const side2title = document.getElementById("side2title");
  const side2 = document.getElementById("side2");
  side2.style.display = "none";
  if (markedCards === 'true') cardsToReview = getMarkedCards(cardsToReview);
  document.getElementById("left-arrow").style.display = "none";
  console.log(cardsToReview)
  if (cardsToReview.length < 2) document.getElementById("right-arrow").style.display = "none";
  else document.getElementById("right-arrow").style.display = "block";
  currentCard = 0;
  side1title.innerHTML = cardsToReview[currentCard].side1;
  side2title.innerHTML = cardsToReview[currentCard].side2;
  setPhotos(cardsToReview[currentCard].id);
  setCardCounter();
});

function changeCard(change) {
  let newCurrent = currentCard + change;
  if (newCurrent >= 0 || newCurrent < cardsToReview.length) {
    currentCard = newCurrent;
    const side1title = document.getElementById("side1title");
    const side2title = document.getElementById("side2title");
    side1title.innerHTML = cardsToReview[currentCard].side1;
    side2title.innerHTML = cardsToReview[currentCard].side2;
    setPhotos(cardsToReview[currentCard].id);
    const leftArrow = document.getElementById("left-arrow");
    const rightArrow = document.getElementById("right-arrow");
    if (currentCard === 0) {
      leftArrow.style.display = "none";
    } else {
      leftArrow.style.display = "block";
    }
    if (currentCard === cardsToReview.length - 1) {
      rightArrow.style.display = "none";
    } else {
      rightArrow.style.display = "block";
    }
    setCardCounter()
  }

}

function setCardCounter() {
  document.getElementById("card-counter").innerHTML = currentCard + 1 + '/' + cardsToReview.length;
}

$$(document).on("click", ".change-side", function () {
  const side1 = document.getElementById("side1");
  const side2 = document.getElementById("side2");
  side1.style.display = "none";
  side2.style.display = "none";
  if (side1showing) {
    side2.style.display = "block";
  } else {
    side1.style.display = "block";
  }
  side1showing = !side1showing;
});