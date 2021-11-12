import React, { useState } from 'react';
import { View } from '@tarojs/components';
import { inject, observer } from 'mobx-react';
import BaseLayout from '@components/base-layout';
import HotList from './hot';
import styles from './index.module.scss';
import AllList from './all';
import MyList from './my';

function RedPacketRanking(props) {
  const { pageText = '', invite } = props;
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
    return <View className={styles.rankingList__select}></View>;
  };

  const handleClickNav = (selectNav) => {
    setNav(selectNav);
  };

  // 加载更多函数
  const loadMore = async () => {
    if (!this.checkLoadCondition()) return;
    return await invite.getInviteUsersList(invite.currentPage + 1);
  };

  return (
    <BaseLayout
      showHeader={false}
      onRefresh={loadMore}
      showRefresh={false}
      isShowLayoutRefresh={false}
      hideCopyright
    >
      <View className={styles.wrap}>
        <View className={styles.header}>
          <View className={styles.totalRevenue}>
            <View className={styles.totalRevenue__money}>0.00</View>
            <View className={styles.totalRevenue__text}>总收益</View>
          </View>
          <View className={styles.totalShare}>
            <View className={styles.totalRevenue__number}>123</View>
            <View className={styles.totalRevenue__text}>总{pageText}（篇）</View>
          </View>
        </View>
        <View className={styles.rankingList}>
          <View className={styles.rankingList__header}>
            <View onClick={() => handleClickNav('my')} className={styles.rankingList__navigation}>我的{pageText}<SelectNav currentNav='my'/></View>
            <View onClick={() => handleClickNav('hot')} className={styles.rankingList__navigation}>热门{pageText}<SelectNav currentNav='hot'/></View>
            <View onClick={() => handleClickNav('all')} className={styles.rankingList__navigation}>{pageText}总排行<SelectNav currentNav='all'/></View>
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
    </BaseLayout>
  );
}

export default inject('user', 'invite')(observer(RedPacketRanking));
