import React from 'react';
import {TouchableOpacity, Image} from 'react-native';
import {AppIcon} from '../AppStyles';

export default function HeaderButton(props) {
  return (
    <TouchableOpacity style={AppIcon.container} onPress={this.props.onPress}>
      <Image style={AppIcon.style} source={props.icon} />
    </TouchableOpacity>
  );
}
