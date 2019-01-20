import React from "react";
import { Modal, Text, View, StyleSheet } from "react-native";
import TextButton from "react-native-button";
import MapView, { Marker } from "react-native-maps";
import { AppStyles, ModalHeaderStyle, HeaderButtonStyle } from "../AppStyles";
import { Configuration } from "../Configuration";

class SelectLocationModal extends React.Component {
  constructor(props) {
    super(props);
    const location = this.props.location;

    this.state = {
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: Configuration.map.delta.latitude,
      longitudeDelta: Configuration.map.delta.longitude
    };
  }

  onDone = () => {
    this.props.onDone({
      latitude: this.state.latitude,
      longitude: this.state.longitude
    });
  };

  onCancel = () => {
    this.props.onCancel();
  };

  onPress = event => {
    this.setState({
      latitude: event.nativeEvent.coordinate.latitude,
      longitude: event.nativeEvent.coordinate.longitude
    });
  };

  onRegionChange = region => {
    this.setState({
      latitude: region.latitude,
      longitude: region.longitude,
      latitudeDelta: region.latitudeDelta,
      longitudeDelta: region.longitudeDelta
    });
  };

  render() {
    return (
      <Modal
        animationType="slide"
        transparent={false}
        onRequestClose={this.onCancel}
      >
        <View style={styles.body}>
          <MapView
            ref={map => (this.map = map)}
            onPress={this.onPress}
            style={styles.mapView}
            onRegionChangeComplete={this.onRegionChange}
            region={{
              latitude: this.state.latitude,
              longitude: this.state.longitude,
              latitudeDelta: this.state.latitudeDelta,
              longitudeDelta: this.state.longitudeDelta
            }}
          >
            <Marker
              draggable
              coordinate={{
                latitude: this.state.latitude,
                longitude: this.state.longitude
              }}
              onDragEnd={this.onPress}
            />
          </MapView>
          <View style={[ModalHeaderStyle.bar, styles.topbar]}>
            <TextButton
              style={[ModalHeaderStyle.rightButton, styles.rightButton]}
              onPress={this.onDone}
            >
              Done
            </TextButton>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    width: "100%",
    height: "100%"
  },
  rightButton: {
    paddingRight: 10
  },
  topbar: {
    position: "absolute",
    backgroundColor: "transparent",
    width: "100%"
  },
  mapView: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: AppStyles.color.grey
  }
});

export default SelectLocationModal;
