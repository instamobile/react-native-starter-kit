import React from 'react';
import { StyleSheet, View } from 'react-native';
import MenuButton from '../components/MenuButton';
import { AppIcon } from '../AppStyles';
import auth from '@react-native-firebase/auth';
import { useDispatch } from 'react-redux';
import { logout } from '../reducers';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DrawerContainer({navigation}) {
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await auth().signOut();
      
      await AsyncStorage.multiRemove([
        '@loggedInUserID:id',
        '@loggedInUserID:key',
        '@loggedInUserID:password'
      ]);
      
      dispatch(logout());
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'LoginStack', params: { screen: 'Welcome' } }],
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={styles.content}>
      <View style={styles.container}>
        <MenuButton
          title="LOG OUT"
          source={AppIcon.images.logout}
          onPress={handleLogout}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },
});