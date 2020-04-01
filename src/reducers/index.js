import { NavigationActions } from "react-navigation";
import { combineReducers } from "redux";
import { RootNavigator } from "../navigations/AppNavigation";
import firebase from "react-native-firebase";
import { AsyncStorage } from "react-native";

// Start with two routes: The Main screen, with the Login screen on top.
const firstAction = RootNavigator.router.getActionForPathAndParams(
  "LoginStack"
);
const initialNavState = RootNavigator.router.getStateForAction(firstAction);

function nav(state = initialNavState, action) {
  let nextState;
  switch (action.type) {
    case "Login":
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: "DrawerStack" }),
        state
      );
      break;
    case "Logout":
      try {
        firebase.auth().signOut();
        nextState = RootNavigator.router.getStateForAction(
          NavigationActions.navigate({ routeName: "LoginStack" }),
          state
        );
      } catch (e) {
        console.log(e);
      }
      break;
    default:
      nextState = RootNavigator.router.getStateForAction(action, state);
      break;
  }

  // Simply return the original `state` if `nextState` is null or undefined.
  return nextState || state;
}

const initialAuthState = { isLoggedIn: false };

function auth(state = initialAuthState, action) {
  switch (action.type) {
    case "Login":
      return { ...state, isLoggedIn: true, user: action.user };
    case "Logout":
      AsyncStorage.removeItem("@loggedInUserID:id");
      AsyncStorage.removeItem("@loggedInUserID:key");
      AsyncStorage.removeItem("@loggedInUserID:password");
      return { ...state, isLoggedIn: false, user: {} };
    default:
      return state;
  }
}

const AppReducer = combineReducers({
  nav,
  auth
});

export default AppReducer;
