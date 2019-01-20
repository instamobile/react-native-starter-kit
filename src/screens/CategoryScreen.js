import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import FastImage from "react-native-fast-image";
import { AppStyles } from "../AppStyles";
import firebase from "react-native-firebase";

const PRODUCT_ITEM_HEIGHT = 100;
const PRODUCT_ITEM_OFFSET = 5;

class CategoryScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: "Collections"
  });

  constructor(props) {
    super(props);

    this.ref = firebase
      .firestore()
      .collection("universal_categories")
      .orderBy("order", "asc");
    this.unsubscribe = null;

    this.state = {
      loading: false,
      data: [],
      page: 1,
      seed: 1,
      error: null,
      refreshing: false
    };
  }

  onCollectionUpdate = querySnapshot => {
    const data = [];
    querySnapshot.forEach(doc => {
      const { name, photo } = doc.data();
      data.push({
        id: doc.id,
        doc,
        name, // DocumentSnapshot
        photo
      });
    });

    this.setState({
      data,
      loading: false
    });
  };

  componentDidMount() {
    this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onPress = item => {
    this.props.navigation.navigate("Listing", { item: item });
  };

  renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => this.onPress(item)}>
      <View style={styles.container}>
        <FastImage style={styles.photo} source={{ uri: item.photo }} />
        <View style={styles.overlay} />
        <Text numberOfLines={3} style={styles.title}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  render() {
    return (
      <FlatList
        style={styles.flatContainer}
        vertical
        showsVerticalScrollIndicator={false}
        data={this.state.data}
        renderItem={this.renderItem}
        keyExtractor={item => `${item.id}`}
      />
    );
  }
}

const styles = StyleSheet.create({
  flatContainer: {
    paddingLeft: 10,
    paddingRight: 10
  },
  container: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "center",
    margin: PRODUCT_ITEM_OFFSET,
    height: PRODUCT_ITEM_HEIGHT
  },
  title: {
    color: "white",
    fontSize: 17,
    fontFamily: AppStyles.fontName.bold,
    textAlign: "center"
  },
  photo: {
    height: PRODUCT_ITEM_HEIGHT,
    ...StyleSheet.absoluteFillObject
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)"
  }
});

export default CategoryScreen;
