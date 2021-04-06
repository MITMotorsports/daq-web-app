import React from "react";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./components/SignIn";

import firebase from "firebase/app";
import "firebase/auth";

const App: React.FC = () => (
  <Router>
    <Switch>
      <Route path="/signin" component={SignIn} />
      <Route
        path="/home"
        exact
        render={() =>
          firebase.auth().currentUser !== null ? (
            <Home />
          ) : (
            <Redirect to="/signin" />
          )
        }
      />
      <Route path="/">
        <Redirect to="/home" />
      </Route>
    </Switch>
  </Router>
);

export default App;
