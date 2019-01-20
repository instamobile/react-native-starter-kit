import React from "react";
import { FlatList, Text, View } from "react-native";
import { ListItem, SearchBar } from "react-native-elements";
import firebase from "react-native-firebase";
import { ListStyle } from "../AppStyles";
import { Configuration } from "../Configuration";

class SearchScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      headerTitle: (
        <SearchBar
          containerStyle={{
            backgroundColor: "transparent",
            borderBottomColor: "transparent",
            borderTopColor: "transparent",
            flex: 1
          }}
          inputStyle={{
            backgroundColor: "rgba(0.9, 0.9, 0.9, 0.1)",
            borderRadius: 10,
            color: "black"
          }}
          showLoading
          clearIcon={true}
          searchIcon={true}
          onChangeText={text => params.handleSearch(text)}
          // onClear={alert('onClear')}
          placeholder="Search"
        />
      )
    };
  };

  constructor(props) {
    super(props);

    this.ref = firebase.firestore().collection("universal_listings");
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
  onSearch = text => {
    this.ref = firebase.firestore().collection("universal_listings");
    this.searchedText = text;

    this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
  };

  onCollectionUpdate = querySnapshot => {
    const data = [];
    querySnapshot.forEach(doc => {
      const listing = doc.data();
      var text =
        this.searchedText != null ? this.searchedText.toLowerCase() : "";
      var index = listing.name.toLowerCase().search(text);
      if (index != -1) {
        data.push({ ...listing, id: doc.id });
      }
    });

    this.setState({
      data,
      loading: false
    });
  };

  componentDidMount() {
    this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
    this.props.navigation.setParams({
      handleSearch: this.onSearch
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
    return (
      <FlatList
        data={this.state.data}
        renderItem={this.renderItem}
        keyExtractor={item => `${item.id}`}
        initialNumToRender={5}
        refreshing={this.state.refreshing}
      />
    );
  }
}

export default SearchScreen;
