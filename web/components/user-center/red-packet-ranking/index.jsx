import React, { useState } from 'react';
import classnames from 'classnames';
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
    return <span className={styles.rankingList__underline}></span>;
  };

  const handleClickNav = (nav) => {
    setNav(nav);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.totalRevenue}>
          <span className={styles.totalRevenue__money}>0.00</span>
          <span className={styles.totalRevenue__money}>123</span>
        </div>
        <div className={styles.totalShare}>
          <span className={styles.totalRevenue__text}>总收益（元）</span>
          <span className={styles.totalRevenue__text}>总{pageText}（篇）</span>
        </div>
      </div>
      <div className={styles.rankingList}>
        <div className={styles.rankingList__header}>
          <div
            onClick={() => handleClickNav('my')}
            className={classnames(styles.rankingList__navigation, {[styles.rankingList__select]: nav === 'my'})}
          >
            我的{pageText}
            <SelectNav currentNav='my'/>
          </div>
          <div
            onClick={() => handleClickNav('hot')}
            className={classnames(styles.rankingList__navigation, {[styles.rankingList__select]: nav === 'hot'})}
          >
            热门{pageText}
            <SelectNav currentNav='hot'/>
          </div>
          <div
            onClick={() => handleClickNav('all')}
            className={classnames(styles.rankingList__navigation, {[styles.rankingList__select]: nav === 'all'})}
          >
            {pageText}总排行
            <SelectNav currentNav='all'/>
          </div>
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
  );
}

export default RedPacketRanking;
