import React, { Component } from 'react';
import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import Button from '@discuzq/design/dist/components/button/index';
import { inject, observer } from 'mobx-react';
import time from '@discuzq/sdk/dist/time';

@inject('site')
@inject('user')
@observer
export default class MemberShipCard extends Component {
  constructor(props) {
    super(props);
  }

  handleRenewalFee = () => {
    this.props.onRenewalFeeClick && this.props.onRenewalFeeClick();
  };

  // 获取日期格式
  getDateFormat = () => {
    if (time.isCurrentYear(this.props.user?.expiredAt)) {
      return 'MM月DD日';
    } else {
      return 'YYYY年MM月DD日';
    }
  };

  renderFeeDateContent = () => {
    if (this.props.user?.expiredDays === 0) {
      return (
        <>
          <Text className={styles.feeDay}>{this.props.user?.expiredDays}</Text>天
        </>
      );
    } else if (this.props.user?.isIndefiniteDuration) {
      return <Text className={styles.noTimeDate}>无限期</Text>;
    } else {
      return (
        <>
          <Text className={styles.feeDay}>{this.props.user?.expiredDays}</Text>天•
          {time.formatDate(this.props.user?.expiredAt, this.getDateFormat())}
        </>
      );
    }
  };

  render() {
    const { shipCardClassName } = this.props;
    return (
      <View className={`${styles.memberShipCardWrapper} ${shipCardClassName}`}>
        <View className={styles.MemberShipCardContent}>
          <View className={styles.roleType}>{this.props.user?.groupName}</View>
          <View className={styles.tagline}>访问海量站点内容</View>
          <View className={styles.RenewalFee}>
            {!this.props.user?.isIndefiniteDuration && (
              <Button onClick={this.handleRenewalFee} type="primary" className={styles.btn}>
                续费
              </Button>
            )}
            <Text className={styles.feeTimer}>{this.renderFeeDateContent()}</Text>
          </View>
        </View>
      </View>
    );
  }
}
