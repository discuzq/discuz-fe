import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';
import Button from '@discuzq/design/dist/components/button/index';
import { View, Text } from '@tarojs/components';
import { numberFormat } from '@common/utils/number-format';
import renewPay from '@common/pay-bussiness/renew-pay';

@inject('site')
@inject('user')
@observer
class RenewalFee extends Component {
  handleRenewPay = async () => {
    const sitePrice = this.props.site?.sitePrice;
    const siteName = this.props.site?.siteName;
    const userStore = this.props.user;
    const siteStore = this.props.site;
    try {
      await renewPay({ sitePrice, siteName, userStore, siteStore });
    } catch (error) {
      console.error(error);
    }
  };

  render() {
    const siteBackgroundImage = this.props.site?.siteBackgroundImage;
    return (
      <View className={styles.renewalFeeWrapper}>
        <View className={styles.renewalFeeContent}>
          <View
            className={styles.siteBg}
            style={{
              backgroundImage: `url(${siteBackgroundImage})`,
            }}
          ></View>
          <View className={styles.menuInfo}>
            <View className={styles.menuItem}>
              <View className={styles.menuTitle}>站点名称</View>
              <View className={styles.menuValue}>{this.props.site?.siteName}</View>
            </View>
            <View className={styles.menuItem}>
              <View className={styles.menuTitle}>站长</View>
              <View className={styles.menuValue}>
                {this.props.site?.siteAuthor?.nickname || this.props.site?.siteAuthor?.username}
              </View>
            </View>
            <View className={styles.menuItem}>
              <View className={styles.menuTitle}>更新</View>
              <View className={styles.menuValue}>刚刚</View>
            </View>
            <View className={styles.menuItem}>
              <View className={styles.menuTitle}>成员</View>
              <View className={styles.menuValue}>{numberFormat(this.props.site?.countUsers)}</View>
            </View>
            <View className={styles.menuItem}>
              <View className={styles.menuTitle}>主题</View>
              <View className={styles.menuValue}>{this.props.site?.countThreads}</View>
            </View>
            <View className={styles.menuItem}>
              <View className={styles.menuTitle}>有效期</View>
              <View className={styles.menuValue}>{this.props.site?.siteExpire}天</View>
            </View>
          </View>
          {!this.props.user?.isIndefiniteDuration && (
            <View className={styles.feeBtn}>
              <Button type="primary" className={styles.btn} onClick={this.handleRenewPay}>
                ￥{this.props.site?.sitePrice} 立即续费
              </Button>
            </View>
          )}
        </View>
      </View>
    );
  }
}

export default RenewalFee;
