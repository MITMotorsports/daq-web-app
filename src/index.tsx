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
//   apiKey: "AIzaSyBtRjF8u51B3Qf8krhJfeWSLMdoa9A1Zjk",
//   authDomain: "daqapp-51e09.firebaseapp.com",
//   databaseURL: "https://daqapp-51e09.firebaseio.com",
//   projectId: "daqapp-51e09",
//   storageBucket: "daqapp-51e09.appspot.com",
//   messagingSenderId: "710405979523",
//   appId: "1:710405979523:web:d83bc2ec7b57b4947c8ab6",
//   measurementId: "G-16HPSZ3LKH",
// };

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
