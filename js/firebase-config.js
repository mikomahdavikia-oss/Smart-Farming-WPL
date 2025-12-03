const firebaseConfig = {
  apiKey: "AIzaSyDIGuEGgMebzt-OQz8pW7Pvn3StZKaeN1k",
  authDomain: "smart-farming-cabai-rawit.firebaseapp.com",
  databaseURL: "https://smart-farming-cabai-rawit-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-farming-cabai-rawit",
  storageBucket: "smart-farming-cabai-rawit.appspot.com",
  messagingSenderId: "534896191228",
  appId: "1:534896191228:web:185e9e51d4e3d992a9d979",
  measurementId: "G-VR84Y0EVXP"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Database Reference
const database = firebase.database();
window.firebaseDB = database;

console.log('Firebase initialized successfully!');
console.log('Database URL:', firebaseConfig.databaseURL);
