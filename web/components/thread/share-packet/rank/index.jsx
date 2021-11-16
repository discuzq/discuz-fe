import React, { useState } from 'react';
import styles from './index.module.scss';

const imag = 'https://discuz-service-test-1258344699.cos.ap-guangzhou.myqcloud.com/public/avatar/000/00/07/28.png?sign=q-sign-algorithm%3Dsha1%26q-ak%3DAKIDCJAnwjKjthEk6HBm6fwzhCLFRRBlsBxG%26q-sign-time%3D1636709220%3B1636795680%26q-key-time%3D1636709220%3B1636795680%26q-header-list%3Dhost%26q-url-param-list%3D%26q-signature%3D86e544895ef1d96c42c399907ca169711d3d6bf0&&imageMogr2/format/webp/quality/25/interlace/1/ignore-error/1';

const content = props => (
    <div className={styles.root}>
        <div className={styles.list}>
        <div className={styles.listItem}>
          <div className={styles.left}>
            <img className={styles.avatar} src={imag}></img>
            网友H1QYGY
          </div>
          <div>2021-08-20</div>
          <div className={styles.guafen}>瓜分了<span>66</span> 元</div>
        </div>
        <div className={styles.listItem}>
          <div className={styles.left}>
            <img className={styles.avatar} src={imag}></img>
            网友H1QYGY
          </div>
          <div>2021-08-20</div>
          <div className={styles.guafen}>瓜分了<span>66</span> 元</div>
        </div>
        <div className={styles.listItem}>
          <div className={styles.left}>
            <img className={styles.avatar} src={imag}></img>
            网友H1QYGY
          </div>
          <div>2021-08-20</div>
          <div className={styles.guafen}>瓜分了<span>66</span> 元</div>
        </div>
      </div>
    </div>
);

export default content;
