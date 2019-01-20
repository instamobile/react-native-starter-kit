import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { ListItem } from "react-native-elements";
import firebase from "react-native-firebase";
import { AppIcon, AppStyles, ListStyle, HeaderButtonStyle } from "../AppStyles";
import HeaderButton from "../components/HeaderButton";
import { Configuration } from "../Configuration";
import MapView, { Marker } from "react-native-maps";
import FilterViewModal from "../components/FilterViewModal";

class ListingScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title:
      typeof navigation.state.params == "undefined" ||
      typeof navigation.state.params.item == "undefined"
        ? "Listing"
        : navigation.state.params.item.name,
    headerRight: (
      <View style={HeaderButtonStyle.multi}>
        <HeaderButton
          style={{ tintColor: AppStyles.color.tint }}
          icon={
            navigation.state.params.mapMode
              ? AppIcon.images.list
              : AppIcon.images.map
          }
          onPress={() => {
            navigation.state.params.onChangeMode();
          }}
        />
        <HeaderButton
          style={{ tintColor: AppStyles.color.tint }}
          icon={AppIcon.images.filters}
          onPress={() => {
            navigation.state.params.onSelectFilter();
          }}
        />
      </View>
    )
  });

  constructor(props) {
    super(props);

    const { navigation } = props;
    const item = navigation.getParam("item");

    this.state = {
      category: item,
      filter: {},
      data: [],
      mapMode: false,
      filterModalVisible: false
    };

    this.ref = firebase
      .firestore()
      .collection("universal_listings")
      .where("category_id", "==", this.state.category.id);
    this.unsubscribe = null;
  }

  onSelectFilter = () => {
    this.setState({ filterModalVisible: true });
  };

  onSelectFilterCancel = () => {
    this.setState({ filterModalVisible: false });
  };

  onSelectFilterDone = filter => {
    this.setState({ filter: filter });
    this.setState({ filterModalVisible: false });
    this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
  };

  onChangeMode = () => {
    const newMode = !this.state.mapMode;
    this.setState({ mapMode: newMode });
    this.props.navigation.setParams({
      mapMode: newMode
    });
  };

  onCollectionUpdate = querySnapshot => {
    const data = [];
    let max_latitude = -400,
      min_latitude = 400,
      max_longitude = -400,
      min_logitude = 400;

    const filter = this.state.filter;
    querySnapshot.forEach(doc => {
      const listing = doc.data();
      console.log(listing.mapping);
      let matched = true;
      Object.keys(filter).forEach(function(key) {
        if (
          filter[key] != "Any" &&
          filter[key] != "All" &&
          listing.mapping[key] != filter[key]
        ) {
          matched = false;
        }
      });

      console.log("matched=" + matched);

      if (!matched) return;

      if (max_latitude < listing.coordinate._latitude)
        max_latitude = listing.coordinate._latitude;
      if (min_latitude > listing.coordinate._latitude)
        min_latitude = listing.coordinate._latitude;
      if (max_longitude < listing.coordinate._longitude)
        max_longitude = listing.coordinate._longitude;
      if (min_logitude > listing.coordinate._longitude)
        min_logitude = listing.coordinate._longitude;
      data.push({ ...listing, id: doc.id });
    });

    this.setState({
      latitude: (max_latitude + min_latitude) / 2,
      longitude: (max_longitude + min_logitude) / 2,
      latitudeDelta: Math.abs(
        (max_latitude - (max_latitude + min_latitude) / 2) * 3
      ),
      longitudeDelta: Math.abs(
        (max_longitude - (max_longitude + min_logitude) / 2) * 3
      ),
      data
    });
  };

  componentDidMount() {
    this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
    this.props.navigation.setParams({
      mapMode: this.state.mapMode,
      onChangeMode: this.onChangeMode,
      onSelectFilter: this.onSelectFilter
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }
  renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: "86%",
          backgroundColor: "#CED0CE",
          marginLeft: "14%"
        }}
      />
    );
  };

  onPress = item => {
    this.props.navigation.navigate("Detail", { item: item });
  };

  renderItem = ({ item }) => (
    <ListItem
      key={item.id}
      title={item.name}
      titleStyle={ListStyle.title}
      subtitle={
        <View style={ListStyle.subtitleView}>
          <View style={ListStyle.leftSubtitle}>
            <Text style={ListStyle.time}>
              {Configuration.timeFormat(item.post_time)}
            </Text>
            <Text style={ListStyle.place}>{item.place}</Text>
          </View>
          <Text numberOfLines={1} style={ListStyle.price}>
            {item.price}
          </Text>
        </View>
      }
      onPress={() => this.onPress(item)}
      avatarStyle={ListStyle.avatarStyle}
      avatarContainerStyle={ListStyle.avatarStyle}
      avatar={{ uri: item.cover_photo }}
      containerStyle={{ borderBottomWidth: 0 }}
      hideChevron={true}
    />
  );

  render() {
    markerArr = this.state.data.map(listing => (
      <Marker
        title={listing.name}
        description={listing.description}
        coordinate={{
          latitude: listing.coordinate._latitude,
          longitude: listing.coordinate._longitude
        }}
      />
    ));

    return (
      <View>
        {this.state.mapMode && (
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
        )}
        {!this.state.mapMode && (
          <FlatList
            data={this.state.data}
            renderItem={this.renderItem}
            keyExtractor={item => `${item.id}`}
            initialNumToRender={5}
            refreshing={this.state.refreshing}
          />
        )}
        {this.state.filterModalVisible && (
          <FilterViewModal
            value={this.state.filter}
            onCancel={this.onSelectFilterCancel}
            onDone={this.onSelectFilterDone}
          />
        )}
      </View>
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

export default ListingScreen;
