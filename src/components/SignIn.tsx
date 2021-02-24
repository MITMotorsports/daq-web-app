import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import TextField from "@material-ui/core/TextField";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import CardHeader from "@material-ui/core/CardHeader";
import Button from "@material-ui/core/Button";

import firebase from "firebase/app";
import "firebase/auth";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: "flex",
      flexWrap: "wrap",
      width: 400,
      margin: `${theme.spacing(0)} auto`,
    },
    loginBtn: {
      marginTop: theme.spacing(2),
      flexGrow: 1,
    },
    header: {
      textAlign: "center",
      background: "#212121",
      color: "#fff",
    },
    card: {
      marginTop: theme.spacing(10),
    },
  })
);

const SignIn = () => {
  const classes = useStyles();

  // The only state we need to track in this component
  // is email and password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // `history` is used to redirect the user back to the homepage
  // once they have logged in
  // (read: we are adding to the browser's history. That's why it's called useHistory)
  const history = useHistory();

  // this function will be triggered when the user clicks Login
  const handleLogin = () => {
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)

      // Sign in is an asyncronous operation, so we need
      // to attach a callback that is triggered when a response is returned.
      .then((resp) => {
        console.log(`Signed in as ${resp.user?.email}`);
        // If we get here, the login was successful.
        // Push to history to redirect to the Home page.
        history.push("/");
      })

      // An error is thrown if login fails for any reason, which we catch and handle here.
      // TODO: Can you figure out a way to display the error message to the user?
      // Maybe store the error message as a state variable and display it in red text.
      .catch((error: firebase.auth.Error) => {
        console.error("Failed to sign in");
        console.log(error.message);
      });
  };

  return (
    <form className={classes.container}>
      <Card className={classes.card}>
        <CardHeader
          className={classes.header}
          title="Sign In to MIT Motorsports"
        />
        <CardContent>
          <TextField
            fullWidth
            type="email"
            placeholder="Email"
            margin="normal"
            onChange={(e) => {
              // TODO: Set state using this value
            }}
          />
          <TextField
            fullWidth
            type="password"
            placeholder="Password"
            margin="normal"
            onChange={(e) => {
              // TODO: Set state using this value
            }}
          />
        </CardContent>
        <CardActions>
          <Button
            variant="contained"
            size="large"
            color="secondary"
            className={classes.loginBtn}
            onClick={handleLogin}
            disabled={
              undefined // TODO: Button should be disabled if `email` or `password` has length === 0
            }
          >
            Login
          </Button>
        </CardActions>
      </Card>
    </form>
  );
};

export default SignIn;
