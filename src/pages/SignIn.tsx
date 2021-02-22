import React from "react";

import firebase from "firebase/app";
import "firebase/auth";

const SignIn: React.FC = () => {
    const email = ""
    const password = ""

    firebase.auth().createUserWithEmailAndPassword(email, password)
  .then((userCredential) => {
    // Signed in 
    var user = userCredential.user;
    // ...
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    // ..
  });

  return (
    <h1>SIGN IN PAGE</h1>
  );


};



  export default SignIn;