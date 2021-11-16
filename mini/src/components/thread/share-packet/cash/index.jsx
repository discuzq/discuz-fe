import React, { useState } from 'react';
import { View } from '@tarojs/components'
import styles from './index.module.scss';


const content = (props) => (
    <View className={styles.root}>
      <View className={styles.list}>
        <View className={styles.listItem}>
          <View className={styles.left}>获得 <View className={styles.red}>0.55</View>元 </View>
          <View>2021-08-20</View>
        </View>
        <View className={styles.listItem}>
          <View className={styles.left}>获得 <View className={styles.red}>0.55</View>元 </View>
          <View>2021-08-20</View>
        </View>
        <View className={styles.listItem}>
          <View className={styles.left}>获得 <View className={styles.red}>0.55</View>元 </View>
          <View>2021-08-20</View>
        </View>
      </View>
    </View>
);

export default content;
