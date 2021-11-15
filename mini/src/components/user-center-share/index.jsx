import React from 'react';
import { inject, observer } from 'mobx-react';
import { View, Text } from '@tarojs/components';

import styles from './index.module.scss';

class UserCenterShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <View>
        <Text>分享中心</Text>
      </View>
    );
  }
}

export default UserCenterShare;
