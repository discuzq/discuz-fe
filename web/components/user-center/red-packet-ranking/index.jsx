import React, { useState } from 'react';
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
    return <span className={styles.rankingList__select}></span>;
  };

  const handleClickNav = (nav) => {
    setNav(nav);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.totalRevenue}>
          <div className={styles.totalRevenue__money}>0.00</div>
          <div className={styles.totalRevenue__text}>总收益</div>
        </div>
        <div className={styles.totalShare}>
          <div className={styles.totalRevenue__number}>123</div>
          <div className={styles.totalRevenue__text}>总{pageText}（篇）</div>
        </div>
      </div>
      <div className={styles.rankingList}>
        <div className={styles.rankingList__header}>
          <div onClick={() => handleClickNav('my')} className={styles.rankingList__navigation}>我的{pageText}<SelectNav currentNav='my'/></div>
          <div onClick={() => handleClickNav('hot')} className={styles.rankingList__navigation}>热门{pageText}<SelectNav currentNav='hot'/></div>
          <div onClick={() => handleClickNav('all')} className={styles.rankingList__navigation}>{pageText}总排行<SelectNav currentNav='all'/></div>
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
