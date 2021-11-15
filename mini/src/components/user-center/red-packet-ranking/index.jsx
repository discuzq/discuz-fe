import React, { useState } from 'react';
import classnames from 'classnames';
import { View } from '@tarojs/components';
import styles from './index.module.scss';
import HotList from './hot';
import AllList from './all';
import MyList from './my';

function RedPacketRanking(props) {
  const { pageText = '' } = props;
  const [nav, setNav] = useState('hot');

  const ReadPacketList = () => {
    switch (nav) {
      case 'hot':
        return <HotList {...props}/>;
      case 'all':
        return <AllList {...props}/>;
      case 'my':
        return <MyList {...props}/>;
    }
    return <></>;
  };

  const SelectNav  = ({ currentNav }) => {
    if (currentNav !== nav) {
      return <></>;
    }
    return <View className={styles.rankingList__underline}></View>;
  };

  const handleClickNav = (selectNav) => {
    setNav(selectNav);
  };

  return (
    <View className={styles.wrap}>
      <View className={styles.header}>
        <View className={styles.totalRevenue}>
          <View className={styles.totalRevenue__money}>0.00</View>
          <View className={styles.totalRevenue__money}>123</View>
        </View>
        <View className={styles.totalShare}>
          <View className={styles.totalRevenue__text}>总收益（元）</View>
          <View className={styles.totalRevenue__text}>总{pageText}（篇）</View>
        </View>
      </View>
      <View className={styles.rankingList}>
        <View className={styles.rankingList__header}>
          <View
            onClick={() => handleClickNav('my')}
            className={classnames(styles.rankingList__navigation, {[styles.rankingList__select]: nav === 'my'})}
          >
            我的{pageText}
            <SelectNav currentNav='my'/>
          </View>
          <View
            onClick={() => handleClickNav('hot')}
            className={classnames(styles.rankingList__navigation, {[styles.rankingList__select]: nav === 'hot'})}
          >
            热门{pageText}
            <SelectNav currentNav='hot'/>
          </View>
          <View
            onClick={() => handleClickNav('all')}
            className={classnames(styles.rankingList__navigation, {[styles.rankingList__select]: nav === 'all'})}
          >
            {pageText}总排行
            <SelectNav currentNav='all'/>
          </View>
        </View>
      <ReadPacketList/>
      <View className={`${styles.refreshView}`}>
        <View className={styles.lineSty}>
            <View className={styles.noMoreLeft}></View>
            <View>没有更多内容了</View>
            <View className={styles.noMoreRight}></View>
        </View>
      </View>
    </View>
  </View>
  );
}

export default RedPacketRanking;
