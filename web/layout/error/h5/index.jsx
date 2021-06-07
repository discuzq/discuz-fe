import React, { useState } from 'react';
import styles from './index.module.scss';
import { Button } from '@discuzq/design';
import Header from '@components/header';

export default function ErrorPage(props) {
  const [text] = useState(props.text || '服务器错误 SERVER ERROR');

  const onReflush = () => {
    window.location.reload();
  };

  return (
    <div className={styles.page}>
      <Header></Header>

      <div className={styles.body}>
        <img className={styles.icon} src="/dzq-img/error.png" />
        <span className={styles.text}>{text}</span>
      </div>

      <div className={styles.footer}>
        <Button onClick={onReflush} className={styles.button} type="primary">
          点我刷新
        </Button>
      </div>
    </div>
  );
}
