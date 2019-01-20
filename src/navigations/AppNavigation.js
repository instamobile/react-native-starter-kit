import React from "react";
import { Animated, Easing, Image, StyleSheet } from "react-native";
import { connect } from "react-redux";
import {
  DrawerNavigator,
  createStackNavigator,
  createBottomTabNavigator
} from "react-navigation";
import {
  createReactNavigationReduxMiddleware,
  reduxifyNavigator
} from "react-navigation-redux-helpers";
import HomeScreen from "../screens/HomeScreen";
import CategoryScreen from "../screens/CategoryScreen";
import DetailScreen from "../screens/DetailScreen";
import ListingScreen from "../screens/ListingScreen";
import LoginScreen from "../screens/LoginScreen";
import MapScreen from "../screens/MapScreen";
import SavedListingScreen from "../screens/SavedListingScreen";
import SearchScreen from "../screens/SearchScreen";
import SignupScreen from "../screens/SignupScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import { AppIcon, AppStyles } from "../AppStyles";
import { Configuration } from "../Configuration";
import DrawerContainer from "../components/DrawerContainer";

const noTransitionConfig = () => ({
  transitionSpec: {
    duration: 0,
    timing: Animated.timing,
    easing: Easing.step0
  }
});

const middleware = createReactNavigationReduxMiddleware(
  "root",
  state => state.nav
);

// login stack
const LoginStack = createStackNavigator(
  {
    Login: { screen: LoginScreen },
    Signup: { screen: SignupScreen },
    Welcome: { screen: WelcomeScreen }
  },
  {
    initialRouteName: "Welcome",
    headerMode: "float",
    navigationOptions: ({ navigation }) => ({
      headerTintColor: "red",
      headerTitleStyle: styles.headerTitleStyle
    }),
    cardStyle: { backgroundColor: "#FFFFFF" }
  }
);

const HomeStack = createStackNavigator(
  {
    Home: { screen: HomeScreen },
    Listing: { screen: ListingScreen },
    Detail: { screen: DetailScreen },
    Map: { screen: MapScreen }
  },
  {
    initialRouteName: "Home",
    headerMode: "float",

    headerLayoutPreset: "center",
    navigationOptions: ({ navigation }) => ({
      headerTintColor: "red",
      headerTitleStyle: styles.headerTitleStyle
    }),
    cardStyle: { backgroundColor: "#FFFFFF" }
  }
);

const CollectionStack = createStackNavigator(
  {
    Category: { screen: CategoryScreen },
    Listing: { screen: ListingScreen },
    Detail: { screen: DetailScreen },
    Map: { screen: MapScreen }
  },
  {
    initialRouteName: "Category",
    headerMode: "float",
    headerLayoutPreset: "center",
    cardStyle: { backgroundColor: "#FFFFFF" },
    navigationOptions: ({ navigation }) => ({
      headerTintColor: "red",
      headerTitleStyle: styles.headerTitleStyle
    })
  }
);

const SavedListingStack = createStackNavigator(
  {
    SavedListing: { screen: SavedListingScreen },
    Detail: { screen: DetailScreen },
    Map: { screen: MapScreen }
  },
  {
    initialRouteName: "SavedListing",
    headerMode: "float",
    headerLayoutPreset: "center",
    cardStyle: { backgroundColor: "#FFFFFF" },
    navigationOptions: ({ navigation }) => ({
      headerTintColor: "red",
      headerTitleStyle: styles.headerTitleStyle
    })
  }
);

const SearchStack = createStackNavigator(
  {
    Search: { screen: SearchScreen },
    Detail: { screen: DetailScreen },
    Map: { screen: MapScreen }
  },
  {
    initialRouteName: "Search",
    headerMode: "float",
    headerLayoutPreset: "center",
    cardStyle: { backgroundColor: "#FFFFFF" },
    navigationOptions: ({ navigation }) => ({
      headerTintColor: "red",
      headerTitleStyle: styles.headerTitleStyle
    })
  }
);

const TabNavigator = createBottomTabNavigator(
  {
    Home: { screen: HomeStack },
    Collections: { screen: CollectionStack },
    Saved: { screen: SavedListingStack },
    Search: { screen: SearchStack }
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, tintColor }) => {
        const { routeName } = navigation.state;
        let iconName;
        if (routeName === "Home") {
          iconName = AppIcon.images.home;
        } else if (routeName === "Collections") {
          iconName = AppIcon.images.collections;
        } else if (routeName === "Saved") {
          iconName = AppIcon.images.heart;
        } else if (routeName === "Search") {
          iconName = AppIcon.images.search;
        }

        // You can return any component that you like here! We usually use an
        // icon component from react-native-vector-icons
        return (
          <Image
            style={{
              tintColor: focused ? AppStyles.color.tint : AppStyles.color.grey
            }}
            source={iconName}
          />
        );
      }
    }),
    initialLayout: {
      height: 300
    },
    tabBarOptions: {
      activeTintColor: AppStyles.color.tint,
      inactiveTintColor: "gray",
      style: {
        height: Configuration.home.tab_bar_height
      }
    }
  }
);

// drawer stack
const DrawerStack = DrawerNavigator(
  {
    Tab: TabNavigator
  },
  {
    drawerPosition: "left",
    initialRouteName: "Tab",
    drawerWidth: 200,
    contentComponent: DrawerContainer
  }
);

// Manifest of possible screens
const RootNavigator = createStackNavigator(
  {
    LoginStack: { screen: LoginStack },
    DrawerStack: { screen: DrawerStack }
  },
  {
    // Default config for all screens
    headerMode: "none",
    initialRouteName: "DrawerStack",
    transitionConfig: noTransitionConfig,
    navigationOptions: ({ navigation }) => ({
      color: "black"
    })
  }
);

const AppWithNavigationState = reduxifyNavigator(RootNavigator, "root");

const mapStateToProps = state => ({
  state: state.nav
});

const AppNavigator = connect(mapStateToProps)(AppWithNavigationState);

const styles = StyleSheet.create({
  headerTitleStyle: {
    fontWeight: "bold",
    textAlign: "center",
    alignSelf: "center",
    color: "black",
    flex: 1,
    fontFamily: AppStyles.fontName.main
  }
});

export { RootNavigator, AppNavigator, middleware };
