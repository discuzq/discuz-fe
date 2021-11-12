import React from 'react';
import { Button } from '@discuzq/design';
import { IMG_SRC_HOST } from '@common/constants/site';
import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import styles from './index.module.scss';

const redPacketIcon = `${IMG_SRC_HOST}/assets/redpacket-mini.10b46eefd630a5d5d322d6bbc07690ac4536ee2d.png`;

export default function ThreadList() {
  return (
    <View className={styles.wrap}>
      <View className={styles.list}>
        <View className={styles.list__left}>
          <View className={styles.list__title}>
            <Image className={styles.list__icon} src={redPacketIcon}/>
            <Text>【讨论中】南京师范大学</Text>
          </View>
          <View className={styles.list__hint}>已奖励0.00元，你领取0.00元</View>
        </View>
        <View className={styles.list__right}>
          <Button className={styles.list__button} type='primary'>分享</Button>
        </View>
      </View>
    </View>
  );
}
