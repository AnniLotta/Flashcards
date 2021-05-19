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

$$(document).on("click", ".add-deck", function () {
  const deckJson = dataToJson("#deck-info");
  addNewDeck(deckJson);
  const deckList = document.getElementById('deck-list');
  getDecks(deckList);
  goHome();
});

$$(document).on("click", ".edit-deck", function () {
  const deckJson = dataToJson("#edit-deck-form");
  localStorage.setItem(deckJson.key, JSON.stringify(deckJson));
  document.getElementById('deck-title').innerHTML = deckJson.name + `<a class="get-deck-details-data" href="/edit-deck/${"deck" + deckJson.key}/" data-deck-id="${deckJson.key}"><i class="icon f7-icons">pencil</i></a>`;
});

$$(document).on("click", ".delete-deck", function () {
  const deckJson = dataToJson("#edit-deck-form");
  localStorage.removeItem(deckJson.key);
  goHome();
});

$$(document).on("click", ".get-deck-details-data", function () {
  let deckId = $$(this).data("deck-id");
  const deckJson = JSON.parse(localStorage.getItem(deckId));
  $$(document).on("page:afterin", '.page[data-name="edit-deck"]', function () {
    setDeckData(deckJson, deckId);
  });
});

$$(document).on("click", ".add-card", function () {
  const cardJson = dataToJson("#card-info");
  const img1 = document.getElementById("add-side1photo");
  const img2 = document.getElementById("add-side2photo");
  console.log("taalla")
  addNewCard(cardJson, img1, img2);
  const cardList = document.getElementById('card-list');
  getCards(cardList);
});

$$(document).on("click", ".delete-card", function () {
  let cardId = $$(this).data("card-id");
  localStorage.removeItem(cardId);
  const element = document.getElementById("card-list");
  getCards(element)
});


$$(document).on("click", ".get-cards", function () {
  let deckId = $$(this).data("deck-id");
  $$(document).on("page:init", '.page[data-name="card-list"]', function () {
    const element = document.getElementById("card-list");
    getCards(element, deckId);
  });
});

let cardsToReview = []
let currentCard = 0;
let side1showing = true;

function setPhotos() {
  const img1 = localStorage.getItem(cardsToReview[currentCard].img1);
  const img2 = localStorage.getItem(cardsToReview[currentCard].img2);
  const imgElement1 = document.getElementById("side1photo");
  const imgElement2 = document.getElementById("side2photo");
  imgElement1.style.display = "none";
  imgElement2.style.display = "none";

  if (img1) {
    imgElement1.src = img1;
    imgElement1.style.display = "block";
  }
  if (img2) {
    imgElement2.src = img2;
    imgElement2.style.display = "block";
  }

}

$$(document).on("click", ".start_review", function () {
  document.getElementById("review-title").innerHTML = 'Review ' + JSON.parse(localStorage.getItem(currentDeckId)).name;
  const side1title = document.getElementById("side1title");
  const side2title = document.getElementById("side2title");
  const side2 = document.getElementById("side2");
  side2.style.display = "none";
  document.getElementById("left-arrow").style.display = "none";
  cardsToReview = getCardsOfCurrentDeck();
  currentCard = 0;
  side1title.innerHTML = cardsToReview[currentCard].side1;
  side2title.innerHTML = cardsToReview[currentCard].side2;
  setPhotos();
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
    setPhotos();
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

function setDeckData(deckJson, deckId) {
  document.getElementById("deck-name").value = deckJson.name;
  document.getElementById("deck-description").value = deckJson.description;
  document.getElementById("deck-id").value = deckId;
}

function openCamera(number) {
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
        const elementId = "add-side" + number + "photo";
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