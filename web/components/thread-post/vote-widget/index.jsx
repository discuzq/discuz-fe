import React from 'react';
import { Icon } from '@discuzq/design';
import styles from './index.module.scss';


const Index = ({ onDelete }) => (
  <div className={styles['vote-widget']}>
    <div className={styles.left}>
      <Icon className={styles.icon} name='DeleteOutlined' />
      <span className={styles.text}>投票</span>
    </div>
    <Icon className={styles.right} name='DeleteOutlined' onClick={onDelete} />
  </div>
);

export default Index;
