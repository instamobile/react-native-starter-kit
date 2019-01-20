import React from "react";
import { StyleSheet } from "react-native";
import firebase from "react-native-firebase";
import MapView, { Marker } from "react-native-maps";
import { AppIcon, AppStyles } from "../AppStyles";
import HeaderButton from "../components/HeaderButton";
import { Configuration } from "../Configuration";

class MapScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: "Map View"
    // headerRight: <HeaderButton icon={AppIcon.images.map} onPress={() => { navigation.goBack(null) }} />,
  });

  constructor(props) {
    super(props);

    const { navigation } = props;
    const item = navigation.getParam("item");

    if (item) {
      this.ref = firebase
        .firestore()
        .collection("universal_listings")
        .where("category_id", "==", item.id);
    } else {
      this.ref = firebase.firestore().collection("universal_listings");
    }

    this.unsubscribe = null;

    this.state = {
      category: item,
      loading: false,
      data: [],
      page: 1,
      seed: 1,
      error: null,
      latitude: Configuration.map.origin.latitude,
      longitude: Configuration.map.origin.longitude,
      latitudeDelta: Configuration.map.delta.latitude,
      longitudeDelta: Configuration.map.delta.longitude,
      refreshing: false
    };
  }

  onCollectionUpdate = querySnapshot => {
    const data = [];
    let max_latitude = -400,
      min_latitude = 400,
      max_longitude = -400,
      min_logitude = 400;
    querySnapshot.forEach(doc => {
      const listing = doc.data();
      if (max_latitude < listing.coordinate._latitude)
        max_latitude = listing.coordinate._latitude;
      if (min_latitude > listing.coordinate._latitude)
        min_latitude = listing.coordinate._latitude;
      if (max_longitude < listing.coordinate._longitude)
        max_longitude = listing.coordinate._longitude;
      if (min_logitude > listing.coordinate._longitude)
        min_logitude = listing.coordinate._longitude;
      data.push({ ...listing, id: doc.id });
      console.log("max=" + max_latitude + " min=" + min_latitude);
    });

    this.setState({
      data,
      latitude: (max_latitude + min_latitude) / 2,
      longitude: (max_longitude + min_logitude) / 2,
      latitudeDelta: Math.abs(
        (max_latitude - (max_latitude + min_latitude) / 2) * 3
      ),
      longitudeDelta: Math.abs(
        (max_longitude - (max_longitude + min_logitude) / 2) * 3
      ),
      loading: false
    });
    console.log(this.state.latitude);
    console.log(this.state.longitude);
  };

  componentDidMount() {
    this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onPress = item => {
    this.props.navigation.navigate("Detail", { item: item });
  };

  render() {
    markerArr = this.state.data.map(listing => (
      <Marker
        title={listing.name}
        description={listing.description}
        onCalloutPress={() => {
          this.onPress(listing);
        }}
        coordinate={{
          latitude: listing.coordinate._latitude,
          longitude: listing.coordinate._longitude
        }}
      />
    ));

    return (
      <MapView
        style={styles.mapView}
        region={{
          latitude: this.state.latitude,
          longitude: this.state.longitude,
          latitudeDelta: this.state.latitudeDelta,
          longitudeDelta: this.state.longitudeDelta
        }}
      >
        {markerArr}
      </MapView>
    );
  }
}

const styles = StyleSheet.create({
  mapView: {
    width: "100%",
    height: "100%",
    backgroundColor: AppStyles.color.grey
  }
});

export default MapScreen;
