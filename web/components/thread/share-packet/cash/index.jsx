import React, { useState } from 'react';
import styles from './index.module.scss';
import { Button, Tabs } from '@discuzq/design';


const content = (props) => (
    <div className={styles.root}>
      <div className={styles.list}>
        <div className={styles.listItem}>
          <div className={styles.left}>获得 <span>0.55</span>元 </div>
          <div>2021-08-20</div>
        </div>
        <div className={styles.listItem}>
          <div className={styles.left}>获得 <span>0.55</span>元 </div>
          <div>2021-08-20</div>
        </div>
        <div className={styles.listItem}>
          <div className={styles.left}>获得 <span>0.55</span>元 </div>
          <div>2021-08-20</div>
        </div>
      </div>
    </div>
);

export default content;
