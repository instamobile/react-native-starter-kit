import React, {useEffect, useState} from 'react';
import {Image, Pressable, StyleSheet, View, ActivityIndicator} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch} from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import {AppIcon, AppStyles} from '../AppStyles';
import DrawerContainer from '../components/DrawerContainer';
import {login} from '../reducers';
import LoadScreen from '../screens/LoadScreen';


const Stack = createStackNavigator();


// login stack
const LoginStack = () => (
  <Stack.Navigator
    initialRouteName="Welcome"
    screenOptions={{
      headerTitleAlign: 'center',
      headerTintColor: 'red',
      headerTitleStyle: styles.headerTitleStyle,
      headerMode: 'float',
    }}>
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
  </Stack.Navigator>
);

const HomeStack = () => (
  <Stack.Navigator
    initialRouteName="Home"
    screenOptions={{
      headerTitleAlign: 'center',
      headerTintColor: 'red',
      headerTitleStyle: styles.headerTitleStyle,
      headerMode: 'float',
    }}>
    <Stack.Screen
      name="Home"
      component={HomeScreen}
      options={({navigation}) => ({
        headerLeft: () => (
          <Pressable onPress={() => navigation.openDrawer()}>
            <Image style={styles.iconStyle} source={AppIcon.images.menu} />
          </Pressable>
        ),
        headerLeftContainerStyle: {paddingLeft: 10},
      })}
    />
  </Stack.Navigator>
);

const BottomTab = createBottomTabNavigator();

const TabNavigator = () => (
  <BottomTab.Navigator
    initialRouteName="HomeStack"
    screenOptions={{
      tabBarInactiveTintColor: 'grey',
      tabBarActiveTintColor: AppStyles.color.tint,
      tabBarIcon: ({focused}) => {
        return (
          <Image
            style={{
              tintColor: focused ? AppStyles.color.tint : AppStyles.color.grey,
            }}
            source={AppIcon.images.home}
          />
        );
      },
      headerShown: false,
    }}>
    <BottomTab.Screen
      options={{tabBarLabel: 'Home'}}
      name="HomeStack"
      component={HomeStack}
    />
  </BottomTab.Navigator>
);

// drawer stack
const Drawer = createDrawerNavigator();
const DrawerStack = () => (
  <Drawer.Navigator
    screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 250, 
        },
    }}
    
    drawerContent={({navigation}) => (
      <DrawerContainer navigation={navigation} />
    )}>
    <Drawer.Screen name="Tab" component={TabNavigator} />
  </Drawer.Navigator>
);

// Root Navigator with Auth Check
const RootNavigator = ({initialRoute}) => (
  <Stack.Navigator
    initialRouteName={initialRoute}
    screenOptions={{
      headerShown: false,
      headerTitleAlign: 'center',
    }}>
    <Stack.Screen name="LoginStack" component={LoginStack} />
    <Stack.Screen name="DrawerStack" component={DrawerStack} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const [initializing, setInitializing] = useState(true);
  const [initialRoute, setInitialRoute] = useState('LoginStack');
  const dispatch = useDispatch();

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const userId = await AsyncStorage.getItem('@loggedInUserID:id');
      
      if (userId) {
        // Get user data from Firestore
        const userDoc = await firestore()
          .collection('users')
          .doc(userId)
          .get();

        if (userDoc.exists) {
          // Dispatch user data to Redux store
          dispatch(login(userDoc.data()));
          setInitialRoute('DrawerStack');
        }
      }
    } catch (error) {
      console.log('Error checking login status:', error);
    } finally {
      setInitializing(false);
    }
  };

  if (initializing) {
    return <LoadScreen />;
  }

  return (
    <NavigationContainer>
      <RootNavigator initialRoute={initialRoute} />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  headerTitleStyle: {
    fontWeight: 'bold',
    textAlign: 'center',
    alignSelf: 'center',
    color: 'black',
  },
  iconStyle: {
    tintColor: AppStyles.color.tint,
    width: 30,
    height: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppNavigator;