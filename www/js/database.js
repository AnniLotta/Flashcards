try {
    if (useDatabaseApi) {
      initFirebase(); // initialize Firebase    
    }
  } catch {
    console.log('Firebase is not initialized.');
    console.log('Data is saved to the localStorage.');
  }
  
  // Add new items to the Shop List
  function addDeckToDatabase(deckJson) {
    db.collection('decks').add({
        //'key': "deck" + allDecks++,
        'name': deckJson.name,
        'description': deckJson.description
    });
  }