import React from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform
} from "react-native";

import Button from "react-native-button";
import firebase from "react-native-firebase";
import { connect } from "react-redux";
import {
  AppIcon,
  AppStyles,
  TwoColumnListStyle
} from "../AppStyles";
import { Image } from "react-native";
import { Configuration } from "../Configuration";

class HomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: "Home",
    headerLeft: () => {
      return (
        <TouchableOpacity
          onPress={() => {
            navigation.openDrawer();
          }}
        >
          {<Image
              style={styles.userPhoto}
              resizeMode={FastImage.resizeMode.cover}
              source={AppIcon.images.defaultUser}
            />}
        </TouchableOpacity>
      );
    },
  });

  constructor(props) {
    super(props);
  }

  
  

  componentDidMount() {
    this.props.navigation.setParams({
      menuIcon: this.props.user.profileURL
    });
  }

  render() {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Get Started</Text>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
    padding: Configuration.home.listing_item.offset
  },
  title: {
    fontFamily: AppStyles.fontName.bold,
    fontWeight: "bold",
    color: AppStyles.color.title,
    fontSize: 25
  },
  userPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 5
  }
});

const mapStateToProps = state => ({
  user: state.auth.user
});

export default connect(mapStateToProps)(HomeScreen);
