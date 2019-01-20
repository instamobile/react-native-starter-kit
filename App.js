import React from "react";
import { AppRegistry } from "react-native";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";

import AppReducer from "./src/reducers";
import { AppNavigator, middleware } from "./src/navigations/AppNavigation";

const store = createStore(AppReducer, applyMiddleware(middleware));

console.disableYellowBox = true;

class ListingApp extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <AppNavigator />
      </Provider>
    );
  }
}

AppRegistry.registerComponent("ListingApp", () => ListingApp);

export default ListingApp;
