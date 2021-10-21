import { combineReducers } from "redux";
import auther from '@react-native-firebase/auth';
import { AsyncStorage } from "react-native";


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
  auth,
});

export default AppReducer;
