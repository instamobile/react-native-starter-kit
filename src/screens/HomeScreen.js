import React, { useLayoutEffect } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { connect, useSelector } from 'react-redux';
import { AppStyles } from '../AppStyles';
import { Configuration } from '../Configuration';

function HomeScreen({ navigation }) {
  const auth = useSelector((state) => state.auth);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Home',
    });
  }, []);

  const getUserName = () => {
    if (auth.user) {
      if (auth.user.fullName) {
        return auth.user.fullName;
      }
      const { firstName, lastName } = auth.user;
      if (firstName && lastName) {
        return `${firstName} ${lastName}`;
      } else if (firstName) {
        return firstName;
      } else if (lastName) {
        return lastName;
      }
    }
    return 'User';
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        Welcome {getUserName()}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Configuration.home.listing_item.offset,
  },
  title: {
    fontWeight: 'bold',
    color: AppStyles.color.title,
    fontSize: 25,
  },
});

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

export default connect(mapStateToProps)(HomeScreen);
