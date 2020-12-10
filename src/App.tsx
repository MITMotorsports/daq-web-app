import React from "react";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";
import Home from "./pages/Home";

const App: React.FC = () => (
  <Router>
    <Switch>
      <Route path="/home" component={Home} exact={true} />
      <Route exact path="/" render={() => <Redirect to="/home" />} />
    </Switch>
  </Router>
);

export default App;
