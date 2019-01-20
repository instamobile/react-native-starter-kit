import React from "react";
import {
  Platform,
  Dimensions,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  View
} from "react-native";
import { AppStyles, AppIcon, HeaderButtonStyle } from "../AppStyles";
import firebase from "react-native-firebase";
import FastImage from "react-native-fast-image";
import Carousel, { Pagination } from "react-native-snap-carousel";
import MapView, { Marker } from "react-native-maps";
import HeaderButton from "../components/HeaderButton";
import StarRating from "react-native-star-rating";
import { Configuration } from "../Configuration";
import { connect } from "react-redux";
import ReviewModal from "../components/ReviewModal";

const { width: viewportWidth, height: viewportHeight } = Dimensions.get(
  "window"
);
const LATITUDEDELTA = 0.0422;
const LONGITUDEDELTA = 0.0221;

class DetailsScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    headerStyle: {
      backgroundColor: "transparent"
    },
    headerRight: (
      <View style={HeaderButtonStyle.multi}>
        <HeaderButton
          style={{ tintColor: AppStyles.color.tint }}
          icon={AppIcon.images.review}
          onPress={() => {
            navigation.state.params.onPressReview();
          }}
        />
        <HeaderButton
          icon={
            navigation.state.params.saved
              ? AppIcon.images.heartFilled
              : AppIcon.images.heart
          }
          onPress={() => {
            navigation.state.params.onPressSave();
          }}
          style={{ tintColor: AppStyles.color.tint }}
        />
      </View>
    )
  });

  constructor(props) {
    super(props);

    const { navigation } = props;
    const item = navigation.getParam("item");

    this.ref = firebase
      .firestore()
      .collection("universal_listings")
      .doc(item.id);
    this.unsubscribe = null;
    this.reviewsRef = firebase
      .firestore()
      .collection("universal_reviews")
      .where("listing_id", "==", item.id);
    this.reviewsUnsubscribe = null;

    this.savedListingsRef = firebase
      .firestore()
      .collection("universal_saved_listings")
      .where("user_id", "==", this.props.user.id)
      .where("listing_id", "==", item.id);
    this.savedListingUnsubscribe = null;

    this.state = {
      activeSlide: 0,
      data: item,
      photo: item.photo,
      reviews: [],
      saved: false,
      users: {},
      reviewModalVisible: false
    };
  }

  onDocUpdate = doc => {
    const listing = doc.data();

    this.setState({
      data: { ...listing, id: doc.id },
      loading: false
    });

    console.log(listing);
  };

  updateReviews = reviews => {
    this.setState({
      reviews: reviews
    });
  };

  onReviewsUpdate = querySnapshot => {
    const data = [];
    const updateReviews = this.updateReviews;

    const state = this.state;
    querySnapshot.forEach(doc => {
      const review = doc.data();

      firebase
        .firestore()
        .collection("users")
        .doc(review.user_id)
        .get()
        .then(function(userDoc) {
          data.push({ ...review, id: doc.id, name: userDoc.data().fullname });
          updateReviews(data);
        });
    });
  };

  onSavedListingsCollectionUpdate = querySnapshot => {
    const savedListingdata = [];
    querySnapshot.forEach(doc => {
      const savedListing = doc.data();
      savedListingdata.push(savedListing);
    });

    this.setState({
      saved: savedListingdata.length > 0
    });

    this.props.navigation.setParams({
      saved: this.state.saved
    });
  };

  onPressReview = () => {
    this.setState({ reviewModalVisible: true });
  };

  onReviewCancel = () => {
    this.setState({ reviewModalVisible: false });
  };

  onPressSave = () => {
    if (this.state.saved) {
      firebase
        .firestore()
        .collection("universal_saved_listings")
        .where("listing_id", "==", this.state.data.id)
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
          listing_id: this.state.data.id
        })
        .then(function(docRef) {})
        .catch(function(error) {
          alert(error);
        });
    }
  };

  componentDidMount() {
    this.unsubscribe = this.ref.onSnapshot(this.onDocUpdate);
    this.reviewsUnsubscribe = this.reviewsRef.onSnapshot(this.onReviewsUpdate);
    this.savedListingsUnsubscribe = this.savedListingsRef.onSnapshot(
      this.onSavedListingsCollectionUpdate
    );

    this.props.navigation.setParams({
      onPressReview: this.onPressReview,
      onPressSave: this.onPressSave,
      saved: this.state.saved
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
    this.reviewsUnsubscribe();
    this.savedListingsUnsubscribe();
  }

  renderItem = ({ item }) => (
    <TouchableOpacity>
      <FastImage
        style={styles.photoItem}
        resizeMode={FastImage.resizeMode.cover}
        source={{ uri: item }}
      />
    </TouchableOpacity>
  );

  renderSeparator = () => {
    return (
      <View
        style={{
          width: 10,
          height: "100%"
        }}
      />
    );
  };

  renderReviewItem = ({ item }) => (
    <View style={styles.reviewItem}>
      <View style={styles.info}>
        <FastImage
          style={styles.userPhoto}
          resizeMode={FastImage.resizeMode.cover}
          source={
            item.authorPhoto
              ? { uri: item.authorPhoto }
              : AppIcon.images.defaultUser
          }
        />
        <View style={styles.detail}>
          <Text style={styles.username}>{item.authorName}</Text>
          <Text style={styles.reviewTime}>
            {Configuration.timeFormat(item.review_time)}
          </Text>
        </View>
        <StarRating
          containerStyle={styles.starRatingContainer}
          disabled={true}
          maxStars={5}
          starSize={22}
          starStyle={styles.starStyle}
          emptyStar={AppIcon.images.starNoFilled}
          fullStar={AppIcon.images.starFilled}
          rating={item.star_count}
        />
      </View>
      <Text style={styles.reviewContent}>{item.content}</Text>
    </View>
  );

  render() {
    const mapping = this.state.data.mapping;
    extraInfoArr = Object.keys(mapping).map(function(key) {
      if (mapping[key] != "Any" && mapping[key] != "All") {
        return (
          <View style={styles.extraRow}>
            <Text style={styles.extraKey}>{key}</Text>
            <Text style={styles.extraValue}>{mapping[key]}</Text>
          </View>
        );
      }
    });

    const { activeSlide } = this.state;
    return (
      <ScrollView style={styles.container}>
        <View style={styles.carousel}>
          <Carousel
            ref={c => {
              this._slider1Ref = c;
            }}
            data={this.state.data.list_of_photos}
            renderItem={this.renderItem}
            sliderWidth={viewportWidth}
            itemWidth={viewportWidth}
            // hasParallaxImages={true}
            inactiveSlideScale={1}
            inactiveSlideOpacity={1}
            firstItem={0}
            loop={false}
            // loopClonesPerSide={2}
            autoplay={false}
            autoplayDelay={500}
            autoplayInterval={3000}
            onSnapToItem={index => this.setState({ activeSlide: index })}
          />
          <Pagination
            dotsLength={this.state.data.list_of_photos.length}
            activeDotIndex={activeSlide}
            containerStyle={styles.paginationContainer}
            dotColor={"rgba(255, 255, 255, 0.92)"}
            dotStyle={styles.paginationDot}
            inactiveDotColor="white"
            inactiveDotOpacity={0.4}
            inactiveDotScale={0.6}
            carouselRef={this._slider1Ref}
            tappableDots={!!this._slider1Ref}
          />
        </View>
        <Text style={styles.title}> {this.state.data.name} </Text>
        <Text style={styles.description}> {this.state.data.description} </Text>
        <Text style={styles.title}> {"Location"} </Text>
        <MapView
          style={styles.mapView}
          initialRegion={{
            latitude: this.state.data.coordinate._latitude,
            longitude: this.state.data.coordinate._longitude,
            latitudeDelta: LATITUDEDELTA,
            longitudeDelta: LONGITUDEDELTA
          }}
        >
          <Marker
            coordinate={{
              latitude: this.state.data.coordinate._latitude,
              longitude: this.state.data.coordinate._longitude
            }}
          />
        </MapView>
        <Text style={styles.title}> {"Extra info"} </Text>
        <View style={styles.extra}>{extraInfoArr}</View>
        {this.state.reviews.length > 0 && (
          <Text style={[styles.title, styles.reviewTitle]}> {"Reviews"} </Text>
        )}
        <FlatList
          data={this.state.reviews}
          renderItem={this.renderReviewItem}
          keyExtractor={item => `${item.id}`}
          initialNumToRender={5}
        />
        {this.state.reviewModalVisible && (
          <ReviewModal
            listing={this.state.data}
            onCancel={this.onReviewCancel}
            onDone={this.onReviewCancel}
          />
        )}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
    height:
      Dimensions.get("window").height - Configuration.home.tab_bar_height - 25,
    position: "absolute"
  },
  title: {
    fontFamily: AppStyles.fontName.bold,
    fontWeight: "bold",
    color: AppStyles.color.title,
    fontSize: 25,
    padding: 10
  },
  reviewTitle: {
    paddingTop: 0
  },
  description: {
    fontFamily: AppStyles.fontName.bold,
    padding: 10,
    color: AppStyles.color.description
  },
  photoItem: {
    backgroundColor: AppStyles.color.grey,
    height: 250,
    width: "100%"
  },
  paginationContainer: {
    flex: 1,
    position: "absolute",
    alignSelf: "center",
    paddingVertical: 8,
    marginTop: 220
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 0
  },
  mapView: {
    width: "100%",
    height: 200,
    backgroundColor: AppStyles.color.grey
  },
  extra: {
    padding: 30,
    paddingTop: 10,
    paddingBottom: 0,
    marginBottom: 30
  },
  extraRow: {
    flexDirection: "row",
    paddingBottom: 10
  },
  extraKey: {
    flex: 2,
    color: AppStyles.color.title,
    fontWeight: "bold"
  },
  extraValue: {
    flex: 1,
    color: "#bcbfc7"
  },
  reviewItem: {
    padding: 10,
    marginLeft: 10
  },
  info: {
    flexDirection: "row"
  },
  userPhoto: {
    width: 44,
    height: 44,
    borderRadius: 22
  },
  detail: {
    paddingLeft: 10,
    flex: 1
  },
  username: {
    color: AppStyles.color.title,
    fontWeight: "bold"
  },
  reviewTime: {
    color: "#bcbfc7",
    fontSize: 12
  },
  starRatingContainer: {
    padding: 10
  },
  starStyle: {
    tintColor: AppStyles.color.tint
  },
  reviewContent: {
    color: AppStyles.color.title,
    marginTop: 10
  }
});

const mapStateToProps = state => ({
  user: state.auth.user
});

export default connect(mapStateToProps)(DetailsScreen);
