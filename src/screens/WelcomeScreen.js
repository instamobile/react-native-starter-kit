import React from "react";
import Button from "react-native-button";
import { Text, View, StyleSheet } from "react-native";
import { AppStyles } from "../AppStyles";
import { AsyncStorage, ActivityIndicator } from "react-native";
import firebase from "react-native-firebase";

class WelcomeScreen extends React.Component {
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true
    };
    this.tryToLoginFirst();
  }

  render() {
    if (this.state.isLoading == true) {
      return (
        <ActivityIndicator
          style={styles.spinner}
          size="large"
          color={AppStyles.color.tint}
        />
      );
    }
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Say hello to your new app</Text>
        <Button
          containerStyle={styles.loginContainer}
          style={styles.loginText}
          onPress={() => this.props.navigation.navigate("Login")}
        >
          Log In
        </Button>
        <Button
          containerStyle={styles.signupContainer}
          style={styles.signupText}
          onPress={() => this.props.navigation.navigate("Signup")}
        >
          Sign Up
        </Button>
      </View>
    );
  }

  async tryToLoginFirst() {
    const email = await AsyncStorage.getItem("@loggedInUserID:key");
    const password = await AsyncStorage.getItem("@loggedInUserID:password");
    const id = await AsyncStorage.getItem("@loggedInUserID:id");
    if (
      id != null &&
      id.length > 0 &&
      password != null &&
      password.length > 0
    ) {
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(user => {
          const { navigation } = this.props;
          firebase
            .firestore()
            .collection("users")
            .doc(id)
            .get()
            .then(function(doc) {
              var dict = {
                id: id,
                email: email,
                profileURL: doc.photoURL,
                fullname: doc.displayName
              };
              if (doc.exists) {
                navigation.dispatch({
                  type: "Login",
                  user: dict
                });
              }
            })
            .catch(function(error) {
              const { code, message } = error;
              alert(message);
            });
          this.state.isLoading = false;
        })
        .catch(error => {
          const { code, message } = error;
          alert(message);
          // For details of error codes, see the docs
          // The message contains the default Firebase string
          // representation of the error
        });
      return;
    }
    const fbToken = await AsyncStorage.getItem(
      "@loggedInUserID:facebookCredentialAccessToken"
    );
    if (id != null && id.length > 0 && fbToken != null && fbToken.length > 0) {
      const credential = firebase.auth.FacebookAuthProvider.credential(fbToken);
      firebase
        .auth()
        .signInWithCredential(credential)
        .then(result => {
          var user = result.user;
          var userDict = {
            id: user.uid,
            fullname: user.displayName,
            email: user.email,
            profileURL: user.photoURL
          };
          this.props.navigation.dispatch({
            type: "Login",
            user: userDict
          });
        })
        .catch(error => {
          this.setState({ isLoading: false });
        });
      return;
    }
    this.setState({ isLoading: false });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 150
  },
  logo: {
    width: 200,
    height: 200
  },
  title: {
    fontSize: AppStyles.fontSize.title,
    fontWeight: "bold",
    color: AppStyles.color.tint,
    marginTop: 20,
    textAlign: "center",
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20
  },
  loginContainer: {
    width: AppStyles.buttonWidth.main,
    backgroundColor: AppStyles.color.tint,
    borderRadius: AppStyles.borderRadius.main,
    padding: 10,
    marginTop: 30
  },
  loginText: {
    color: AppStyles.color.white
  },
  signupContainer: {
    width: AppStyles.buttonWidth.main,
    backgroundColor: AppStyles.color.white,
    borderRadius: AppStyles.borderRadius.main,
    padding: 8,
    borderWidth: 1,
    borderColor: AppStyles.color.tint,
    marginTop: 15
  },
  signupText: {
    color: AppStyles.color.tint
  },
  spinner: {
    marginTop: 200
  }
});

export default WelcomeScreen;
