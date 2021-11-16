import React, { useState } from 'react';
import { View, Image } from '@tarojs/components'

import styles from './index.module.scss';

const imag = 'https://discuz-service-test-1258344699.cos.ap-guangzhou.myqcloud.com/public/avatar/000/00/07/41.png?sign=q-sign-algorithm%3Dsha1%26q-ak%3DAKIDCJAnwjKjthEk6HBm6fwzhCLFRRBlsBxG%26q-sign-time%3D1636981358%3B1637067817%26q-key-time%3D1636981358%3B1637067817%26q-header-list%3Dhost%26q-url-param-list%3D%26q-signature%3Dcea3b50fcb9be2b2941a0fd86c14f8001d4954d0&&imageMogr2/format/jpg/quality/15/interlace/1/ignore-error/1';

const content = props => (
    <View className={styles.root}>
        <View className={styles.list}>
        <View className={styles.listItem}>
          <View className={styles.left}>
            <Image className={styles.avatar} src={imag}></Image>
            网友H1QYGY
            <View className={styles.label}>新</View>
          </View>
          <View>2021-08-20</View>
        </View>
        <View className={styles.listItem}>
          <View className={styles.left}>
            <Image className={styles.avatar} src={imag}></Image>
            网友H1QYGY
            <View className={`${styles.label} ${styles.disable}`}>无效</View>
          </View>
          <View>2021-08-20</View>
        </View>
        <View className={styles.listItem}>
          <View className={styles.left}>
            <Image className={styles.avatar} src={imag}></Image>
            网友H1QYGY
          </View>
          <View>2021-08-20</View>
        </View>
      </View>
    </View>
);

export default content;
