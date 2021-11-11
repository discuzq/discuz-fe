import React, { useState } from 'react';
import { inject, observer } from 'mobx-react';
import Avatar from '@components/avatar';
import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

function AllList() {
  return (
    <View className={styles.wrap}>
      <View className={styles.header}>
        <View className={styles.ranking}>排名</View>
        <View className={styles.nickname}>用户昵称</View>
        <View className={styles.user__amount}>邀请用户数</View>
        <View className={styles.money}>获得赏金（元）</View>
      </View>
      <View className={styles.list}>
        <View className={styles.list__item}>
          <View className={styles.ranking}>1</View>
          <View className={styles.nickname}>
            <Avatar
              className={styles.avatar}
              name='用户名称...'
              circle
              image='https://discuz-service-test-1258344699.cos.ap-guangzhou.myqcloud.com/public/avatar/000/00/09/29.png?sign=q-sign-algorithm%3Dsha1%26q-ak%3DAKIDCJAnwjKjthEk6HBm6fwzhCLFRRBlsBxG%26q-sign-time%3D1636600147%3B1636686607%26q-key-time%3D1636600147%3B1636686607%26q-header-list%3Dhost%26q-url-param-list%3D%26q-signature%3D3c902f16c370de9f70029868d08e5a4c5a13daec&&imageMogr2/format/webp/quality/40/interlace/1/ignore-error/1'
              onClick={() => {}}
            />
            <Text>用户昵称</Text>
          </View>
          <View className={styles.user__amount}>8</View>
          <View className={styles.money}>50.00</View>
        </View>
      </View>
    </View>
  );
}

export default inject('user')(observer(AllList))
