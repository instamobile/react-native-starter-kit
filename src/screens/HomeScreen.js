import React, {useLayoutEffect} from 'react';
import {ScrollView, StyleSheet, Text} from 'react-native';
import {connect, useSelector} from 'react-redux';
import { AppStyles} from '../AppStyles';
import {Configuration} from '../Configuration';

function HomeScreen({navigation}) {
  const auth = useSelector((state) => state.auth);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Home',
    });
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Welcome {auth.user?.fullname ?? 'User'}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    padding: Configuration.home.listing_item.offset,
  },
  title: {
    fontWeight: 'bold',
    color: AppStyles.color.title,
    fontSize: 25,
  },
  userPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 5,
  },
});

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

export default connect(mapStateToProps)(HomeScreen);
