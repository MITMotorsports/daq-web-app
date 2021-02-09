import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import firebase from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyD_br4DD8RAWRheBAs_kB9iHAqoNtPyeSE",
  authDomain: "mitmotorsportsdata.firebaseapp.com",
  databaseURL: "https://mitmotorsportsdata.firebaseio.com",
  projectId: "mitmotorsportsdata",
  storageBucket: "mitmotorsportsdata.appspot.com",
  messagingSenderId: "271412435598",
  appId: "1:271412435598:web:1960a36e3f28fe5febc7df",
  measurementId: "G-1NWE27HQSG"
};

// const firebaseConfig = {
//   apiKey: process.env.REACT_APP_API_KEY,
//   authDomain: process.env.REACT_APP_AUTH_DOMAIN,
//   databaseURL: process.env.REACT_APP_DATABASE_URL,
//   projectId: process.env.REACT_APP_PROJECT_ID,
//   storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
//   messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
//   appId: process.env.REACT_APP_FIREBASE_APP_ID,
//   measurementId: process.env.REACT_APP_MEASUREMENT_ID,
// };
firebase.initializeApp(firebaseConfig);

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
