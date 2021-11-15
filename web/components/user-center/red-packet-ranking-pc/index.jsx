import React, { useState, Fragment } from 'react';
import NoData from '@components/no-data';
import classnames from 'classnames';
import styles from './index.module.scss';
import HotList from './hot';
import AllList from './all';
import MyList from './my';

function RedPacketRankingPC(props) {
  const { pageText = ''} = props;
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
    return <Fragment></Fragment>;
  };

  const SelectNav  = ({ currentNav }) => {
    if (currentNav !== nav) {
      return <Fragment></Fragment>;
    }
    return <span className={styles.rankingList__underline}></span>;
  };

  const handleClickNav = (nav) => {
    setNav(nav);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.title}>{pageText}领红包</div>
        <div className={styles.statistics}>
          <div className={styles.totalRevenue}>
            <div className={styles.totalRevenue__money}>0.00</div>
            <div className={styles.totalRevenue__text}>总收益（元）</div>
          </div>
          <div className={styles.totalShare}>
            <div className={styles.totalRevenue__number}>123</div>
            <div className={styles.totalRevenue__text}>总{pageText}（篇）</div>
          </div>
        </div>
      </div>
      <div className={styles.rankingList}>
        <div className={styles.rankingList__header}>
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
        </div>
        <ReadPacketList/>
      </div>
      <NoData text='没有更多数据了'/>
    </div>
  );
}

export default RedPacketRankingPC;
