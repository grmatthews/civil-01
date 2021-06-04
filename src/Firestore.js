import firebase from "firebase"
import "firebase/firestore"
import "firebase/auth"

const config = {
    apiKey: "AIzaSyA9JB1PuwjbgrkMuEEF0gyhelSWQR2tWug",
    authDomain: "civil-01.firebaseapp.com",
    projectId: "civil-01",
    storageBucket: "civil-01.appspot.com",
    messagingSenderId: "1031801426950",
    appId: "1:1031801426950:web:1b396bddf64f0e2ddc1f87"
  };

firebase.initializeApp(config)

//console.log('!!!!!!!! USING EMULATOR');
//firebase.functions().useEmulator("localhost", 5001);
//firebase.auth().useEmulator("localhost", 9099);

export const provider = new firebase.auth.GoogleAuthProvider()
const auth = firebase.auth()
const functions = firebase.functions()
export const db = firebase.firestore()
export const firebaseConfig = config
const storage = firebase.storage()

console.log("Clearing persistence")
db.clearPersistence()
console.log("Cleared persistence")

db.enablePersistence()

// We seem to be able to connect to google.com,
// however if the emulator is being used uncomment
// this code and start the emulator with:
// firebase emulators:start

// if (window.location.hostname === "localhost") {
//   db.useEmulator("localhost", 8080);
// }

export const fieldval = firebase.firestore.FieldValue
export default db
export { storage, functions, auth }
