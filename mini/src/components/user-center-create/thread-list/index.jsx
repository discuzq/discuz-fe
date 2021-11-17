import React from 'react';
import { inject, observer } from 'mobx-react';
import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import Thread from '@components/thread';
import styles from './index.module.scss';

class ThreadList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <View>
        {this.props.dataSource.map((itemInfo, index) => (
          <View key={index} className={index === 0 ? styles.threadFirstItem : styles.threadItem}>
            <Thread
              key={`${itemInfo.threadId}-${itemInfo.updatedAt}-${itemInfo.user.avatar}`}
              showBottomStyle={this.props.showBottomStyle}
              data={itemInfo}
              isHideBottomEvent
              isShowFissionData
              threadDetailUrl={'/userPages/my/thread-data/index'}
            />
          </View>
        ))}
      </View>
    );
  }
}

export default ThreadList;
