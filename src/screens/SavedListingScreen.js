import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from "react-native";
import firebase from "react-native-firebase";
import { AppStyles, AppIcon, TwoColumnListStyle } from "../AppStyles";
import { connect } from "react-redux";
import FastImage from "react-native-fast-image";
import SavedButton from "../components/SavedButton";
import { Configuration } from "../Configuration";
import StarRating from "react-native-star-rating";

class SavedListingScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: "Saved Items"
  });
  constructor(props) {
    super(props);

    this.savedListingsRef = firebase
      .firestore()
      .collection("universal_saved_listings")
      .where("user_id", "==", this.props.user.id);

    this.state = {
      listings: [],
      savedListings: [],
      loading: false,
      error: null,
      refreshing: false
    };
  }

  onListingsCollectionUpdate = querySnapshot => {
    const data = [];
    querySnapshot.forEach(doc => {
      const listing = doc.data();
      if (this.state.savedListings.findIndex(k => k == doc.id) >= 0) {
        listing.saved = true;
        data.push({ ...listing, id: doc.id });
      }
    });

    this.setState({
      listings: data,
      loading: false
    });
  };

  onSavedListingsCollectionUpdate = querySnapshot => {
    const savedListingdata = [];
    querySnapshot.forEach(doc => {
      const savedListing = doc.data();
      savedListingdata.push(savedListing.listing_id);
    });

    this.listingsRef = firebase.firestore().collection("universal_listings");
    if (this.listingsUnsubscribe) this.listingsUnsubscribe();
    this.listingsUnsubscribe = this.listingsRef.onSnapshot(
      this.onListingsCollectionUpdate
    );

    this.setState({
      savedListings: savedListingdata,
      loading: false
    });
  };

  onPressListingItem = item => {
    this.props.navigation.navigate("Detail", { item: item });
  };

  onPressSavedIcon = item => {
    if (item.saved) {
      firebase
        .firestore()
        .collection("universal_saved_listings")
        .where("listing_id", "==", item.id)
        .where("user_id", "==", this.props.user.id)
        .get()
        .then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
            doc.ref.delete();
          });
        });
    } else {
      firebase
        .firestore()
        .collection("universal_saved_listings")
        .add({
          user_id: this.props.user.id,
          listing_id: item.id
        })
        .then(function(docRef) {})
        .catch(function(error) {
          alert(error);
        });
    }
  };

  componentDidMount() {
    this.savedListingsUnsubscribe = this.savedListingsRef.onSnapshot(
      this.onSavedListingsCollectionUpdate
    );
  }

  componentWillUnmount() {
    this.listingsUnsubscribe();
    this.savedListingsUnsubscribe();
  }

  renderListingItem = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => this.onPressListingItem(item)}>
        <View style={TwoColumnListStyle.listingItemContainer}>
          <FastImage
            style={TwoColumnListStyle.listingPhoto}
            source={{ uri: item.cover_photo }}
          />
          <SavedButton
            style={TwoColumnListStyle.savedIcon}
            onPress={() => this.onPressSavedIcon(item)}
            item={item}
          />
          <Text numberOfLines={1} style={TwoColumnListStyle.listingName}>
            {item.name}
          </Text>
          <Text style={TwoColumnListStyle.listingPlace}>{item.place}</Text>
          <StarRating
            containerStyle={styles.starRatingContainer}
            maxStars={5}
            starSize={15}
            disabled={true}
            starStyle={styles.starStyle}
            emptyStar={AppIcon.images.starNoFilled}
            fullStar={AppIcon.images.starFilled}
            rating={item.starCount}
          />
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          vertical
          showsVerticalScrollIndicator={false}
          numColumns={2}
          data={this.state.listings}
          renderItem={this.renderListingItem}
          keyExtractor={item => `${item.id}`}
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
    padding: Configuration.home.listing_item.offset
  },
  starRatingContainer: {
    width: 90,
    marginTop: 10
  },
  starStyle: {
    tintColor: AppStyles.color.tint
  }
});

const mapStateToProps = state => ({
  user: state.auth.user
});

export default connect(mapStateToProps)(SavedListingScreen);
