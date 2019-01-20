import React from "react";
import { Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import firebase from "react-native-firebase";
import ModalSelector from "react-native-modal-selector";
import {
  AppStyles,
  ModalHeaderStyle,
  ModalSelectorStyle,
  HeaderButtonStyle
} from "../AppStyles";
import TextButton from "react-native-button";

class FilterViewModal extends React.Component {
  constructor(props) {
    super(props);

    this.ref = firebase.firestore().collection("universal_filters");
    this.unsubscribe = null;

    this.state = {
      data: [],
      filter: this.props.value
    };
  }

  onCollectionUpdate = querySnapshot => {
    const data = [];
    querySnapshot.forEach(doc => {
      const filter = doc.data();
      data.push({ ...filter, id: doc.id });
      if (!this.state.filter[filter.name]) {
        this.setState({
          filter: { ...this.state.filter, [filter.name]: filter.options[0] }
        });
      }
    });

    this.setState({
      data
    });
  };

  componentDidMount() {
    this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onDone = () => {
    this.props.onDone(this.state.filter);
  };

  onCancel = () => {
    this.props.onCancel();
  };

  renderItem = item => {
    let filter_key = item.name;

    data = item.options.map((option, index) => ({
      key: option,
      label: option
    }));
    data.unshift({ key: "section", label: item.name, section: true });

    let initValue = item.options[0];
    if (this.state.filter[filter_key]) {
      initValue = this.state.filter[filter_key];
    }

    return (
      <ModalSelector
        touchableActiveOpacity={0.9}
        data={data}
        sectionTextStyle={ModalSelectorStyle.sectionTextStyle}
        optionTextStyle={ModalSelectorStyle.optionTextStyle}
        optionContainerStyle={ModalSelectorStyle.optionContainerStyle}
        cancelContainerStyle={ModalSelectorStyle.cancelContainerStyle}
        cancelTextStyle={ModalSelectorStyle.cancelTextStyle}
        selectedItemTextStyle={ModalSelectorStyle.selectedItemTextStyle}
        backdropPressToClose={true}
        cancelText={"Cancel"}
        initValue={initValue}
        onChange={option => {
          this.setState({
            filter: { ...this.state.filter, [filter_key]: option.key }
          });
        }}
      >
        <View style={styles.container}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.value}>{initValue}</Text>
        </View>
      </ModalSelector>
    );
  };

  render() {
    selectorArray = this.state.data.map(item => {
      return this.renderItem(item);
    });

    return (
      <Modal
        animationType="slide"
        transparent={false}
        onRequestClose={this.onCancel}
      >
        <ScrollView style={styles.body}>
          <View style={ModalHeaderStyle.bar}>
            <Text style={ModalHeaderStyle.title}>Filters</Text>
            <TextButton
              style={ModalHeaderStyle.rightButton}
              onPress={this.onDone}
            >
              Done
            </TextButton>
          </View>
          {selectorArray}
        </ScrollView>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10
  },
  container: {
    justifyContent: "center",
    height: 65,
    alignItems: "center",
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6"
  },
  title: {
    flex: 2,
    textAlign: "left",
    alignItems: "center",
    color: "#464646",
    fontSize: 17,
    fontFamily: AppStyles.fontName.main
  },
  value: {
    textAlign: "right",
    color: AppStyles.color.description,
    fontFamily: AppStyles.fontName.main
  }
});

export default FilterViewModal;
