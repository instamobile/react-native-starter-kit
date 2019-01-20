import React from "react";
import {
  Modal,
  ScrollView,
  Platform,
  StyleSheet,
  Image,
  Button,
  TouchableOpacity,
  TextInput,
  Text,
  View
} from "react-native";
import firebase from "react-native-firebase";
import ModalSelector from "react-native-modal-selector";
import {
  AppStyles,
  AppIcon,
  ModalHeaderStyle,
  ModalSelectorStyle,
  HeaderButtonStyle
} from "../AppStyles";
import TextButton from "react-native-button";
import FastImage from "react-native-fast-image";
import { Configuration } from "../Configuration";
import { connect } from "react-redux";
import ImagePicker from "react-native-image-picker";
import Icon from "react-native-vector-icons/FontAwesome";
import FilterViewModal from "../components/FilterViewModal";
import SelectLocationModal from "../components/SelectLocationModal";
import ActionSheet from "react-native-actionsheet";
import Geocoder from "react-native-geocoding";

class PostModal extends React.Component {
  constructor(props) {
    super(props);

    Geocoder.init("AIzaSyCDeWXVrJxUCRQlpcWK2JJQSB-kFVjCqlM");

    const categories = this.props.categories;
    let category = {};

    if (categories.length > 0) category = categories[0];

    this.state = {
      categories: categories,
      category: category,
      title: "",
      description: "",
      location: {
        latitude: Configuration.map.origin.latitude,
        longitude: Configuration.map.origin.longitude
      },
      localPhotos: [],
      photoUrls: [],
      price: "$1000",
      textInputValue: "",
      filter: {},
      filterValue: "Select...",
      address: "Checking...",
      filterModalVisible: false,
      locationModalVisible: false
    };

    this.setFilterString(this.state.filter);
  }

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState({ location: position.coords });
        this.onChangeLocation(position.coords);
      },
      error => alert(error.message),
      { enableHighAccuracy: false, timeout: 1000 }
    );
  }

  selectLocation = () => {
    this.setState({ locationModalVisible: true });
  };

  onChangeLocation = location => {
    Geocoder.from(location.latitude, location.longitude)
      .then(json => {
        var addressComponent = json.results[0].address_components[0];
        this.setState({ address: addressComponent });
      })
      .catch(error => {
        console.log(error);
        this.setState({ address: "Unknown" });
      });
  };

  setFilterString = filter => {
    let filterValue = "";
    Object.keys(filter).forEach(function(key) {
      if (filter[key] != "Any" && filter[key] != "All") {
        filterValue += " " + filter[key];
      }
    });

    if (filterValue == "") {
      if (Object.keys(filter).length > 0) {
        filterValue = "Any";
      } else {
        filterValue = "Select...";
      }
    }

    this.setState({ filterValue: filterValue });
  };

  onSelectLocationDone = location => {
    this.setState({ location: location });
    this.setState({ locationModalVisible: false });
    this.onChangeLocation(location);
  };

  onSelectLocationCancel = () => {
    this.setState({ locationModalVisible: false });
  };

  selectFilter = () => {
    this.setState({ filterModalVisible: true });
  };

  onSelectFilterCancel = () => {
    this.setState({ filterModalVisible: false });
  };

  onSelectFilterDone = filter => {
    this.setState({ filter: filter });
    this.setState({ filterModalVisible: false });
    this.setFilterString(filter);
  };

  onPressAddPhotoBtn = () => {
    // More info on all the options is below in the API Reference... just some common use cases shown here
    const options = {
      title: "Select a photo",
      storageOptions: {
        skipBackup: true,
        path: "images"
      }
    };

    /**
     * The first arg is the options object for customization (it can also be null or omitted for default options),
     * The second arg is the callback which sends object: response (more info in the API Reference)
     */
    ImagePicker.showImagePicker(options, response => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error);
      } else if (response.customButton) {
        console.log("User tapped custom button: ", response.customButton);
      } else {
        this.setState({
          localPhotos: [...this.state.localPhotos, response.uri]
        });
      }
    });
  };

  onCancel = () => {
    this.props.onCancel();
  };

  onPost = () => {
    const navigation = this.props.navigation;
    const onCancel = this.onCancel;

    if (!this.state.title) {
      alert("Title was not provided.");
      return;
    }
    if (!this.state.description) {
      alert("Description was not set.");
      return;
    }
    if (!this.state.price) {
      alert("Price is empty");
      return;
    }
    if (this.state.localPhotos.length == 0) {
      alert("Please pick photos");
      return;
    }

    if (Object.keys(this.state.filter).length == 0) {
      alert("Please set filters");
      return;
    }

    let photoUrls = [];

    uploadPromiseArray = [];
    this.state.localPhotos.forEach(uri => {
      uploadPromiseArray.push(
        new Promise((resolve, reject) => {
          let filename = uri.substring(uri.lastIndexOf("/") + 1);
          const uploadUri =
            Platform.OS === "ios" ? uri.replace("file://", "") : uri;
          firebase
            .storage()
            .ref(filename)
            .putFile(uploadUri)
            .then(function(snapshot) {
              photoUrls.push(snapshot.downloadURL);
              resolve();
            });
        })
      );
    });

    Promise.all(uploadPromiseArray)
      .then(values => {
        firebase
          .firestore()
          .collection("universal_listings")
          .add({
            user_id: this.props.user.id,
            category_id: this.state.category.id,
            description: this.state.description,
            latitude: this.state.location.latitude,
            longitude: this.state.location.longitude,
            mapping: this.state.filter,
            name: this.state.title,
            price: this.state.price,
            coordinate: new firebase.firestore.GeoPoint(
              this.state.location.latitude,
              this.state.location.longitude
            ),
            post_time: firebase.firestore.FieldValue.serverTimestamp(),
            //TODO:
            place: "San Francisco, CA",
            cover_photo: photoUrls[0],
            list_of_photos: photoUrls
          })
          .then(function(docRef) {
            onCancel();
          })
          .catch(function(error) {
            alert(error);
          });
      })
      .catch(reason => {
        console.log(reason);
      });
  };

  showActionSheet = index => {
    this.setState({
      selectedPhotoIndex: index
    });
    this.ActionSheet.show();
  };

  onActionDone = index => {
    if (index == 0) {
      var array = [...this.state.localPhotos];
      array.splice(this.state.selectedPhotoIndex, 1);
      this.setState({ localPhotos: array });
    }
  };

  render() {
    categoryData = this.state.categories.map((category, index) => ({
      key: category.id,
      label: category.name
    }));
    categoryData.unshift({ key: "section", label: "Category", section: true });

    photos = this.state.localPhotos.map((photo, index) => (
      <TouchableOpacity
        onPress={() => {
          this.showActionSheet(index);
        }}
      >
        <FastImage style={styles.photo} source={{ uri: photo }} />
      </TouchableOpacity>
    ));
    return (
      <Modal
        animationType="slide"
        transparent={false}
        onRequestClose={this.onCancel}
      >
        <View style={ModalHeaderStyle.bar}>
          <Text style={ModalHeaderStyle.title}>Add Listing</Text>
          <TextButton
            style={[ModalHeaderStyle.rightButton, styles.rightButton]}
            onPress={this.onCancel}
          >
            Cancel
          </TextButton>
        </View>
        <ScrollView style={styles.body}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Title</Text>
            <TextInput
              style={styles.input}
              value={this.state.title}
              onChangeText={text => this.setState({ title: text })}
              placeholder="Start typing"
              placeholderTextColor={AppStyles.color.grey}
              underlineColorAndroid="transparent"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <TextInput
              multiline={true}
              numberOfLines={2}
              style={styles.input}
              onChangeText={text => this.setState({ description: text })}
              value={this.state.description}
              placeholder="Start typing"
              placeholderTextColor={AppStyles.color.grey}
              underlineColorAndroid="transparent"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.title}>Price</Text>
              <TextInput
                style={styles.priceInput}
                keyboardType="numeric"
                value={this.state.price}
                onChangeText={text => this.setState({ price: text })}
                placeholderTextColor={AppStyles.color.grey}
                underlineColorAndroid="transparent"
              />
            </View>
            <ModalSelector
              touchableActiveOpacity={0.9}
              data={categoryData}
              sectionTextStyle={ModalSelectorStyle.sectionTextStyle}
              optionTextStyle={ModalSelectorStyle.optionTextStyle}
              optionContainerStyle={ModalSelectorStyle.optionContainerStyle}
              cancelContainerStyle={ModalSelectorStyle.cancelContainerStyle}
              cancelTextStyle={ModalSelectorStyle.cancelTextStyle}
              selectedItemTextStyle={ModalSelectorStyle.selectedItemTextStyle}
              backdropPressToClose={true}
              cancelText={"Cancel"}
              initValue={this.state.category.name}
              onChange={option => {
                this.setState({
                  category: { id: option.key, name: option.label }
                });
              }}
            >
              <View style={styles.row}>
                <Text style={styles.title}>Category</Text>
                <Text style={styles.value}>{this.state.category.name}</Text>
              </View>
            </ModalSelector>
            <TouchableOpacity onPress={this.selectFilter}>
              <View style={styles.row}>
                <Text style={styles.title}>Filters</Text>
                <Text style={styles.value}>{this.state.filterValue}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.selectLocation}>
              <View style={styles.row}>
                <Text style={styles.title}>Location</Text>
                <Text style={styles.value}>{this.state.address}</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.addPhotoTitle}>Add Photos</Text>
            <ScrollView style={styles.photoList} horizontal={true}>
              {photos}
              <TouchableOpacity onPress={this.onPressAddPhotoBtn.bind(this)}>
                <View style={[styles.addButton, styles.photo]}>
                  <Icon name="camera" size={30} color="white" />
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
          {this.state.filterModalVisible && (
            <FilterViewModal
              value={this.state.filter}
              onCancel={this.onSelectFilterCancel}
              onDone={this.onSelectFilterDone}
            />
          )}
          {this.state.locationModalVisible && (
            <SelectLocationModal
              location={this.state.location}
              onCancel={this.onSelectLocationCancel}
              onDone={this.onSelectLocationDone}
            />
          )}
        </ScrollView>
        <TextButton
          containerStyle={styles.addButtonContainer}
          onPress={this.onPost}
          style={styles.addButtonText}
        >
          Post Listing
        </TextButton>
        <ActionSheet
          ref={o => (this.ActionSheet = o)}
          title={"Confirm to delete?"}
          options={["Confirm", "Cancel"]}
          cancelButtonIndex={1}
          destructiveButtonIndex={0}
          onPress={index => {
            this.onActionDone(index);
          }}
        />
      </Modal>
    );
  }
}
const actionSheetStyles = {
  titleBox: {
    backgroundColor: "pink"
  },
  titleText: {
    fontSize: 16,
    color: "#000fff"
  }
};

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: AppStyles.color.white
  },
  divider: {
    backgroundColor: AppStyles.color.background,
    height: 10
  },
  container: {
    justifyContent: "center",
    height: 65,
    alignItems: "center",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: AppStyles.color.grey
  },
  rightButton: {
    marginRight: 10
  },
  sectionTitle: {
    textAlign: "left",
    alignItems: "center",
    color: AppStyles.color.title,
    fontSize: 19,
    padding: 10,
    paddingTop: 15,
    paddingBottom: 7,
    fontFamily: AppStyles.fontName.bold,
    fontWeight: "bold",
    borderBottomWidth: 2,
    borderBottomColor: AppStyles.color.grey
  },
  input: {
    width: "100%",
    fontSize: 19,
    padding: 10,
    textAlignVertical: "top",
    justifyContent: "flex-start",
    paddingLeft: 0,
    paddingRight: 0,
    fontFamily: AppStyles.fontName.main,
    color: AppStyles.color.text
  },
  priceInput: {
    flex: 1,
    borderRadius: 5,
    borderColor: AppStyles.color.grey,
    borderWidth: 0.5,
    height: 40,
    textAlign: "right",
    fontFamily: AppStyles.fontName.main,
    color: AppStyles.color.text
  },
  title: {
    flex: 2,
    textAlign: "left",
    alignItems: "center",
    color: AppStyles.color.title,
    fontSize: 19,
    fontFamily: AppStyles.fontName.bold,
    fontWeight: "bold"
  },
  value: {
    textAlign: "right",
    color: AppStyles.color.description,
    fontFamily: AppStyles.fontName.main
  },
  section: {
    backgroundColor: "white",
    marginBottom: 10
  },
  row: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
    paddingRight: 10
  },
  addPhotoTitle: {
    color: AppStyles.color.title,
    fontSize: 19,
    paddingLeft: 10,
    marginTop: 10,
    fontFamily: AppStyles.fontName.bold,
    fontWeight: "bold"
  },
  photoList: {
    height: 70,
    marginTop: 20,
    marginRight: 10
  },
  photo: {
    marginLeft: 10,
    width: 70,
    height: 70,
    borderRadius: 10
  },

  addButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppStyles.color.tint
  },
  photoIcon: {
    width: 50,
    height: 50
  },
  addButtonContainer: {
    backgroundColor: AppStyles.color.tint,
    borderRadius: 5,
    padding: 15,
    margin: 10,
    marginTop: 20
  },
  addButtonText: {
    color: AppStyles.color.white,
    fontWeight: "bold",
    fontFamily: AppStyles.fontName.bold,
    fontSize: 15
  }
});

const mapStateToProps = state => ({
  user: state.auth.user
});

export default connect(mapStateToProps)(PostModal);
