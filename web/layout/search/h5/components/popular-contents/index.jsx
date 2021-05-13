import React from 'react';

import ThreadContent from '@components/thread';

import styles from './index.module.scss';

/**
 * 热门内容
 * @prop {object[]} data 帖子数据
 */
const PopularContents = ({ data, onItemClick }) => (
  <div className={styles.list}>
    {
      data.map((item, index) => (
        <div key={index}>
          <ThreadContent showBottomStyle={false} className={styles.bottom} data={item} key={index} />
          <div className={styles.hr}></div>
        </div>
      ))
    }
  </div>
);

export default React.memo(PopularContents);
