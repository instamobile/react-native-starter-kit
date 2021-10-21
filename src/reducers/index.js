import {combineReducers} from 'redux';
import AsyncStorage from '@react-native-async-storage/async-storage'

const LOGIN = 'LOGIN';
const LOGOUT = 'LOGOUT';

const initialAuthState = {isLoggedIn: false};

export const login = (user) => ({
  type: LOGIN,
  user,
});

export const logout = (user) => ({
  type: LOGIN,
});

function auth(state = initialAuthState, action) {
  switch (action.type) {
    case LOGIN:
      return {...state, isLoggedIn: true, user: action.user};
    case LOGOUT:
      AsyncStorage.removeItem('@loggedInUserID:id');
      AsyncStorage.removeItem('@loggedInUserID:key');
      AsyncStorage.removeItem('@loggedInUserID:password');
      return {...state, isLoggedIn: false, user: {}};
    default:
      return state;
  }
}

const AppReducer = combineReducers({
  auth,
});

export default AppReducer;
