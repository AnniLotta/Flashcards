let db = null;
let useDatabaseApi = false;

// Firebase configuration and initialization
const initFirebase = () => {
    
    const firebaseConfig = {
        apiKey: "AIzaSyCmMKSQw27UwmCINTlrQnmEwugpeCJqTTQ",
        authDomain: "flashcards-2ec54.firebaseapp.com",
        projectId: "flashcards-2ec54",
        storageBucket: "flashcards-2ec54.appspot.com",
        messagingSenderId: "989496371900",
        appId: "1:989496371900:web:ab1a1a9d984a778ffb3eb9",
        measurementId: "G-TQQCBK5V3M"
    };

  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
};