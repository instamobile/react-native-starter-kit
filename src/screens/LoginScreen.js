import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
// import Button from 'react-native-button';
import {AppStyles} from '../AppStyles';
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {
  GoogleSignin,
  GoogleSigninButton,
} from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch} from 'react-redux';
const FBSDK = require('react-native-fbsdk');
const {LoginManager, AccessToken} = FBSDK;
import {login} from '../reducers';

function LoginScreen({navigation}) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '763342324681-petgvkkeltcfi9qmgr8um8ohak81l953.apps.googleusercontent.com',
    });
  }, []);

  const onPressLogin = () => {
    if (email.length <= 0 || password.length <= 0) {
      Alert.alert('Please fill out the required fields.');
      return;
    }
    auth()
      .signInWithEmailAndPassword(email, password)
      .then((response) => {
        const user_uid = response.user._user.uid;
        firestore()
          .collection('users')
          .doc(user_uid)
          .get()
          .then(function (user) {
            if (user.exists) {
              AsyncStorage.setItem('@loggedInUserID:id', user_uid);
              AsyncStorage.setItem('@loggedInUserID:key', email);
              AsyncStorage.setItem('@loggedInUserID:password', password);
              dispatch(login(user.data()));
              navigation.navigate('DrawerStack');
            } else {
              Alert.alert('User does not exist. Please try again.');
            }
          })
          .catch(function (error) {
            const {message} = error;
            Alert.alert(message);
          });
      })
      .catch((error) => {
        const {message} = error;
        Alert.alert(message);
        // For details of error codes, see the docs
        // The message contains the default Firebase string
        // representation of the error
      });
  };

  const onPressFacebook = () => {
    LoginManager.logInWithPermissions([
      'public_profile',
      'user_friends',
      'email',
    ]).then(
      (result) => {
        if (result.isCancelled) {
          Alert.alert('Whoops!', 'You cancelled the sign in.');
        } else {
          AccessToken.getCurrentAccessToken().then((data) => {
            const credential = firebase.auth.FacebookAuthProvider.credential(
              data.accessToken,
            );
            const accessToken = data.accessToken;
            auth()
              .signInWithCredential(credential)
              .then((result) => {
                var user = result.user;
                AsyncStorage.setItem(
                  '@loggedInUserID:facebookCredentialAccessToken',
                  accessToken,
                );
                AsyncStorage.setItem('@loggedInUserID:id', user.uid);
                var userDict = {
                  id: user.uid,
                  fullname: user.displayName,
                  email: user.email,
                  profileURL: user.photoURL,
                };
                var userData = {
                  ...userDict,
                  appIdentifier: 'rn-android-universal-listings',
                };
                firestore().collection('users').doc(user.uid).set(userData);
                dispatch(login(userDict));
                navigation.navigate('DrawerStack', {
                  user: userDict,
                });
              })
              .catch((error) => {
                alert('Please try again! ' + error);
              });
          });
        }
      },
      (error) => {
        Alert.alert('Sign in error', error);
      },
    );
  };

  const onPressGoogle = () => {
    setLoading(true);
    GoogleSignin.signIn()
      .then((data) => {
        console.log('data', data);
        // Create a new Firebase credential with the token
        const credential = firebase.auth.GoogleAuthProvider.credential(
          data.idToken,
        );
        // Login with the credential
        const accessToken = data.idToken;
        AsyncStorage.setItem(
          '@loggedInUserID:googleCredentialAccessToken',
          accessToken,
        );
        return auth().signInWithCredential(credential);
      })
      .then((result) => {
        setLoading(false);
        var user = result.user;
        AsyncStorage.setItem('@loggedInUserID:id', user.uid);
        var userDict = {
          id: user.uid,
          fullname: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        };
        var data = {
          ...userDict,
          appIdentifier: 'rn-android-universal-listings',
        };
        console.log('data', data);
        firestore().collection('users').doc(user.uid).set(data);
        dispatch(login(userDict));
        navigation.navigate('DrawerStack', {
          user: userDict,
        });
      })
      .catch((error) => {
        const {message} = error;
        setLoading(false);
        Alert.alert(message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, styles.leftTitle]}>Sign In</Text>
      <View style={styles.InputContainer}>
        <TextInput
          style={styles.body}
          placeholder="E-mail or phone number"
          onChangeText={setEmail}
          value={email}
          placeholderTextColor={AppStyles.color.grey}
          underlineColorAndroid="transparent"
        />
      </View>
      <View style={styles.InputContainer}>
        <TextInput
          style={styles.body}
          secureTextEntry={true}
          placeholder="Password"
          onChangeText={setPassword}
          value={password}
          placeholderTextColor={AppStyles.color.grey}
          underlineColorAndroid="transparent"
        />
      </View>
      <TouchableOpacity
        style={styles.loginContainer}
        onPress={() => onPressLogin()}>
        <Text style={styles.loginText}>Log in</Text>
      </TouchableOpacity>
      <Text style={styles.or}>OR</Text>
      <TouchableOpacity
        style={styles.facebookContainer}
        onPress={() => onPressFacebook()}>
        <Text style={styles.facebookText}>Login with Facebook</Text>
      </TouchableOpacity>
      {loading ? (
        <ActivityIndicator
          style={{marginTop: 30}}
          size="large"
          animating={loading}
          color={AppStyles.color.tint}
        />
      ) : (
        <GoogleSigninButton
          style={styles.googleContainer}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Light}
          onPress={onPressGoogle}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  or: {
    color: 'black',
    marginTop: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: AppStyles.fontSize.title,
    fontWeight: 'bold',
    color: AppStyles.color.tint,
    marginTop: 20,
    marginBottom: 20,
  },
  leftTitle: {
    alignSelf: 'stretch',
    textAlign: 'left',
    marginLeft: 20,
  },
  content: {
    paddingLeft: 50,
    paddingRight: 50,
    textAlign: 'center',
    fontSize: AppStyles.fontSize.content,
    color: AppStyles.color.text,
  },
  loginContainer: {
    alignItems: 'center',
    width: AppStyles.buttonWidth.main,
    backgroundColor: AppStyles.color.tint,
    borderRadius: AppStyles.borderRadius.main,
    padding: 10,
    marginTop: 30,
  },
  loginText: {
    color: AppStyles.color.white,
  },
  placeholder: {
    color: 'red',
  },
  InputContainer: {
    width: AppStyles.textInputWidth.main,
    marginTop: 30,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: AppStyles.color.grey,
    borderRadius: AppStyles.borderRadius.main,
  },
  body: {
    height: 42,
    paddingLeft: 20,
    paddingRight: 20,
    color: AppStyles.color.text,
  },
  facebookContainer: {
    alignItems: 'center',
    width: 192,
    backgroundColor: AppStyles.color.facebook,
    borderRadius: AppStyles.borderRadius.main,
    padding: 10,
    marginTop: 30,
  },
  facebookText: {
    color: AppStyles.color.white,
  },
  googleContainer: {
    width: 192,
    height: 48,
    marginTop: 30,
  },
  googleText: {
    color: AppStyles.color.white,
  },
});

export default LoginScreen;
