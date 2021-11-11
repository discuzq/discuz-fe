import React from 'react';
import styles from './index.module.scss';
import { Button } from '@discuzq/design';
import { IMG_SRC_HOST } from '@common/constants/site';

const redPacketIcon = `${IMG_SRC_HOST}/assets/redpacket-mini.10b46eefd630a5d5d322d6bbc07690ac4536ee2d.png`;

export default function ThreadList() {
  return (
    <div className={styles.wrap}>
      <div className={styles.list}>
        <div className={styles.list__left}>
          <div className={styles.list__title}>
            <img className={styles.list__icon} src={redPacketIcon}/>
            <span>【讨论中】南京师范大学</span>
          </div>
          <div className={styles.list__hint}>已奖励0.00元，你领取0.00元</div>
        </div>
        <div className={styles.list__right}>
          <Button className={styles.list__button} type='primary'>分享</Button>
        </div>
      </div>
    </div>
  );
}
