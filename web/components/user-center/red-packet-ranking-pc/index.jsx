import React, { useState } from 'react';
import styles from './index.module.scss';
import { inject, observer } from 'mobx-react';
import BaseLayout from '@components/base-layout';
import Recommend from '@components/recommend';
import QcCode from '@components/qcCode';
import AuthorInfo from '@components/author-info';
import Copyright from '@components/copyright';
import NoData from '@components/no-data';
import classNames from 'classNames';
import HotList from './hot';
import AllList from './all';
import MyList from './my';

function RedPacketRankingPC({ type = '', user }) {
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

  const renderRight = () => {
    console.log(user);
    return (
      <>
        <div className={styles.authorInfo}>
          <AuthorInfo
            user={user}
            isShowBtn={false}
          />
        </div>
        <div className={styles.recommend}>
          <Recommend/>
        </div>
        <div className={styles.qrcode}>
          <QcCode />
        </div>
        <Copyright className={styles.copyright}/>
      </>
    );
  };

  return (
    <BaseLayout
      right={renderRight()}
      onRefresh={loadMore}
      showRefresh={false}
      isShowLayoutRefresh={false}
      rightClassName={classNames(styles.positionSticky, {
        'is-userinfo-show': true,
        'is-operate-show': false,
      })}
    >
      <div className={styles.wrap}>
        <div className={styles.header}>
          <div className={styles.title}>分享领红包</div>
          <div className={styles.statistics}>
            <div className={styles.totalRevenue}>
              <div className={styles.totalRevenue__money}>0.00</div>
              <div className={styles.totalRevenue__text}>总收益</div>
            </div>
            <div className={styles.totalShare}>
              <div className={styles.totalRevenue__number}>123</div>
              <div className={styles.totalRevenue__text}>总分享（篇）</div>
            </div>
          </div>
        </div>
        <div className={styles.rankingList}>
          <div className={styles.rankingList__header}>
            <div onClick={() => handleClickNav('my')} className={styles.rankingList__navigation}>我的分享<SelectNav currentNav='my'/></div>
            <div onClick={() => handleClickNav('hot')} className={styles.rankingList__navigation}>热门分享<SelectNav currentNav='hot'/></div>
            <div onClick={() => handleClickNav('all')} className={styles.rankingList__navigation}>分享总排行<SelectNav currentNav='all'/></div>
          </div>
        <ReadPacketList/>
      </div>
      <NoData text='没有更多数据了'/>
    </div>
    </BaseLayout>
  );
}

export default inject('user')(observer(RedPacketRankingPC));
