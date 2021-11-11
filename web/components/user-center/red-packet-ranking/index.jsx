import React, { useState } from 'react';
import styles from './index.module.scss';
import { Spin, Input, Icon, Dialog, Toast, Button } from '@discuzq/design';
import { inject, observer } from 'mobx-react';
import BaseLayout from '@components/base-layout';
import NoData from '@components/no-data';
import HotList from './hot';
import AllList from './all';
import MyList from './my';

function RedPacketRanking({ type = '' }) {
  const [nav, setNav] = useState('hot');

  const ReadPacketList = () => {
    switch (nav) {
      case 'hot':
        return <HotList/>;
      case 'all':
        return <AllList/>;
      case 'my':
        return <MyList/>;
    }
    return <></>;
  };

  const SelectNav  = ({ currentNav }) => {
    if (currentNav !== nav) {
      return <></>;
    }
    return <span className={styles.rankingList__select}></span>;
  };

  const handleClickNav = (nav) => {
    setNav(nav);
  };

  // 加载更多函数
  const loadMore = async () => {
    const { invite } = this.props;
    if (!this.checkLoadCondition()) return;
    return await invite.getInviteUsersList(invite.currentPage + 1);
  };

  return (
    <BaseLayout
      onRefresh={loadMore}
      showRefresh={false}
      isShowLayoutRefresh={false}
      hideCopyright
    >
      <div className={styles.wrap}>
        <div className={styles.header}>
          <div className={styles.totalRevenue}>
            <div className={styles.totalRevenue__money}>0.00</div>
            <div className={styles.totalRevenue__text}>总收益</div>
          </div>
          <div className={styles.totalShare}>
            <div className={styles.totalRevenue__number}>123</div>
            <div className={styles.totalRevenue__text}>总分享（篇）</div>
          </div>
        </div>
        <div className={styles.rankingList}>
          <div className={styles.rankingList__header}>
            <div onClick={() => handleClickNav('my')} className={styles.rankingList__navigation}>我的分享<SelectNav currentNav='my'/></div>
            <div onClick={() => handleClickNav('hot')} className={styles.rankingList__navigation}>热门分享<SelectNav currentNav='hot'/></div>
            <div onClick={() => handleClickNav('all')} className={styles.rankingList__navigation}>分享总排行<SelectNav currentNav='all'/></div>
          </div>
        <ReadPacketList/>
        <div className={`${styles.refreshView}`}>
          <div className={styles.lineSty}>
              <span className={styles.noMoreLeft}></span>
              <span>没有更多内容了</span>
              <span className={styles.noMoreRight}></span>
          </div>
        </div>
      </div>
    </div>
    </BaseLayout>
  );
}

export default inject('user')(observer(RedPacketRanking));
