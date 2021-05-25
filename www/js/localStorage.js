let allDecks = 0;
let allCards = 0;
allDecks = localStorage.getItem("allDecks") > 0 ? localStorage.getItem("allDecks") : 0;
allCards = localStorage.getItem("allCards") > 0 ? localStorage.getItem("allCards") : 0;
let currentDeckId = '';

function addNewDeckLocal(deckJson) {
    let newDeck = {
        key: "deck" + allDecks++,
        name: deckJson.name,
        description: deckJson.description
    };
    localStorage.setItem(newDeck.key, JSON.stringify(newDeck))
    localStorage.setItem("allDecks", allDecks);
}

function getDecksLocal(element) {
    let empty = true;
    let result = "";
    for (let i = 0; i < localStorage.getItem("allDecks"); i++) {
        if (localStorage.getItem("deck" + i)) {
            empty = false;
            const deckJson = JSON.parse(localStorage.getItem("deck" + i));
            result += getDeckHTML("deck" + i, deckJson.name, deckJson.description);
        }
    }

    if (empty) {
        result += `
        <div class="card-bg block block-strong inset">
            <div class="item-inner display-flex justify-content-center">There are no card decks.</div>
        </div>`;
    }
    element.innerHTML = result;
}

function addCardLocal(cardJson, img1, img2) {
    let newCard = {
        key: "card" + allCards++,
        side1: cardJson.side1,
        side2: cardJson.side2,
        deck: currentDeckId,
        marked: false,
        img1: "",
        img2: ""
    };

    if (img1.style.display !== "none") {
        newCard.img1 = newCard.key + newCard.deck + "1" + ".jpg";
        imageToLocalStorage(newCard.img1, img1);
    }
    if (img2.style.display !== "none") {
        newCard.img2 = newCard.key + newCard.deck + "2" + ".jpg";
        imageToLocalStorage(newCard.img2, img2);
    }
    localStorage.setItem(newCard.key, JSON.stringify(newCard));
    localStorage.setItem("allCards", allCards);
}

function getCardsOfCurrentDeckLocal() {
    let result = [];
    for (let i = 0; i < localStorage.getItem("allCards"); i++) {
        if (localStorage.getItem("card" + i)) {
            const cardJson = JSON.parse(localStorage.getItem("card" + i));
            if (cardJson.deck === currentDeckId) {
                result.push(cardJson);
            }
        }
    }
    return result;
}

function toggleMarkLocal(cardId, starIcon) {
    const cardJson = JSON.parse(localStorage.getItem(cardId));
    cardJson.marked = !cardJson.marked;
    localStorage.setItem(cardJson.key, JSON.stringify(cardJson));

    if (cardJson.marked) {
      starIcon.innerHTML = "star_fill";
    } else starIcon.innerHTML = "star";
    if (!anyMarkedCards()) {
      document.getElementById("review-marked").classList.add("disabled");
    } else document.getElementById("review-marked").classList.remove("disabled");
}

function getCardsLocal(element, deckId) {
    if (deckId) currentDeckId = deckId;
    let empty = true;
    const deckJson = JSON.parse(localStorage.getItem(currentDeckId));
    let result = "";
    for (let i = 0; i < localStorage.getItem("allCards"); i++) {
        if (localStorage.getItem("card" + i)) {
            const cardJson = JSON.parse(localStorage.getItem("card" + i));
            if (cardJson.deck === currentDeckId) {
                empty = false;
                result += getCardHTML("card" + i, cardJson.side1, cardJson.side2, "mark-iconcard" + i, cardJson.marked);
            }
        }
    }
    if (empty) {
        result += `
        <div class="card block block-strong inset">
            <div class="item-inner display-flex justify-content-center">The deck is empty.</div>
        </div>`;
    }

    document.getElementById("deck-title").innerHTML = deckJson.name;
    document.getElementById("edit-icon").innerHTML =
        `<a class="get-deck-details col-60" href="/edit-deck/${currentDeckId}/" data-deck-id="${currentDeckId}">
            <i class="icon f7-icons">pencil</i>
        </a>`;
    element.innerHTML = result;

    if(!anyMarkedCards()) document.getElementById("review-marked").classList.add("disabled");
}

function imageToLocalStorage(fileName, img) {
    let imageData = getImageDataURL(img);
    localStorage.setItem(fileName, imageData);
}

function getImageDataURL(img) {
    let canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    let context = canvas.getContext("2d");
    context.drawImage(img, 0, 0, 146, 146);

    let dataURL = canvas.toDataURL("image/jpg");
    return dataURL;
}