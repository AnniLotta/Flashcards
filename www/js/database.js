try {
    if (useFirebase) {
        initFirebase(); // initialize Firebase    
    }
} catch (e) {
    console.log(e)
    console.log('Firebase is not initialized. Data is saved to the localStorage.');
}

let openDeckId = '';
let allCardsInDB = [];
let cardsInDB = 0;

//Methods for decks//

function addDeckToDatabase(deckJson) {
    db.collection('decks').add({
        'name': deckJson.name,
        'description': deckJson.description
    }).then(() => {
        console.log("Deck added!");
        goHome();
    })
        .catch((error) => {
            console.error("Error adding deck: ", error);
        });
}

const getDecksDatabase = (element) => {
    let isEmpty = true;
    db.collection('decks').onSnapshot((doc) => {
        let result = '';
        doc.docs.forEach((doc) => {
            isEmpty = false;
            const deck = doc.data();
            result += getDeckHTML(doc.id, deck.name, deck.description);
        });

        if (isEmpty) {
            result += `
          <div class="card-bg block block-strong inset">
            <div class="item-inner display-flex justify-content-center">There are no decks in the database.</div>
          </div>`;
        }

        element.innerHTML = result;
    });
}

function setDeckTitle(element) {
    const docRef = db.collection("decks").doc(openDeckId);
    docRef.get().then((doc) => {
        if (doc.exists) {
            document.getElementById(element).innerHTML = doc.data().name;
        }
    });
}

const getCardsDatabase = (element, deckId) => {
    if (deckId) openDeckId = deckId;
    document.getElementById("review-all").classList.remove("disabled");

    //Count the cards in the database
    db.collection('cards').get().then(snap => {
        cardsInDB = snap.size;
    });

    db.collection('cards').onSnapshot((doc) => {
        allCardsInDB = [];
        let isEmpty = true;
        let result = '';
        doc.docs.forEach((doc) => {
            const card = doc.data();
            if (card.deck === openDeckId) {
                isEmpty = false;
                card.id = doc.id;
                allCardsInDB.push(card);
                result += getCardHTML(doc.id, card.side1, card.side2, "mark-iconcard" + doc.id, card.marked);
            }

        });

        //Set the deck title and edit-icion
        setDeckTitle('deck-title');
        document.getElementById("edit-icon").innerHTML =
            `<a class="get-deck-details col-60" href="/edit-deck/${openDeckId}/" data-deck-id="${openDeckId}">
                    <i class="icon f7-icons">pencil</i>
                </a>`;

        //Add all the cards to the card list page        
        element.innerHTML = result;

        //If there are no cards in the deck
        if (isEmpty) {
            //Disable review button
            document.getElementById("review-all").classList.add("disabled");
            result += `
            <div class="card block block-strong inset">
                <div class="item-inner display-flex justify-content-center">The deck is empty.</div>
            </div>`;
            element.innerHTML = result;
        }

        //If there are no marked cards, disable the other review button
        if (!anyMarkedCards(allCardsInDB)) document.getElementById("review-marked").classList.add("disabled");
    });
}

function addCardToDatabase(cardJson, img1, img2) {
    const newCard = {
        'side1': cardJson.side1,
        'side2': cardJson.side2,
        'deck': openDeckId,
        'marked': false,
        'img1': img1.style.display !== 'none',
        'img2': img2.style.display !== 'none'
    }

    db.collection('cards').add(newCard).then((docRef) => {
        if (img1.style.display !== 'none') {
            imageToDB(docRef.id + "1.jpg", img1.src.substring(23));
        }
        if (img2.style.display !== 'none') {
            imageToDB(docRef.id + "2.jpg", img2.src.substring(23));
        }
        console.log("Card added!");
    })
        .catch((error) => {
            console.error("Error adding card: ", error.code);
        });
}

function updateCardDB(cardJson, img1, img2) {
    db.collection("cards").doc(cardJson.key).update({
        side1: cardJson.side1,
        side2: cardJson.side2,
        deck: openDeckId,
        img1: img1.style.display !== 'none',
        img2: img2.style.display !== 'none'
    })
        .then(() => {
            if (img1.style.display !== 'none' && photo1Seleced) {
                imageToDB(cardJson.key + "1.jpg", img1.src.substring(23));
            }
            if (img2.style.display !== 'none' && photo2Seleced) {
                imageToDB(cardJson.key + "2.jpg", img2.src.substring(23));
            }
            console.log("Deck successfully updated!");
        })
        .catch((error) => {
            console.error("Error updating deck: ", error);
        });
}

function toggleMarkDatabase(cardId, starIcon) {
    let marked = false;

    for (i = 0; i < allCardsInDB.length; i++) {
        if (allCardsInDB[i].id === cardId) {
            marked = !allCardsInDB[i].marked
            allCardsInDB[i].marked = marked;
            break;
        }
    }

    //Change the star icon
    if (marked) {
        starIcon.innerHTML = "star_fill";
    } else starIcon.innerHTML = "star";

    //Disable the other review-button, if there are no marked cards
    if (!anyMarkedCards(allCardsInDB)) {
        document.getElementById("review-marked").classList.add("disabled");
    } else document.getElementById("review-marked").classList.remove("disabled");

    //Update mark to the database
    db.collection("cards").doc(cardId).update({
        marked: marked
    });
}

function getCardsOfCurrentDeckDB() {
    let result = [];
    allCardsInDB.forEach((card) => {
        if (card.deck === openDeckId) result.push(card);
    });
    return result;
}

//Methods for images//

function imageToDB(fileName, img) {
    const storageRef = firebase.storage().ref('cards/' + fileName);
    storageRef.putString(img, 'base64').then((snapshot) => {
        console.log('Uploaded a base64 string!');
    })
        .catch((error) => {
            console.error("Error imageToDB: ", error);
        });
}

function getImage(cardId, element) {
    const storageRef = firebase.storage().ref();
    const filename = 'cards/' + cardId + '.jpg';
    const ref = storageRef.child(filename);
    element.style.display = 'block';
    ref.getDownloadURL().then(function (url) {
        element.src = url;
    }).catch(function (error) {
        console.log(error)
    });
};
