import React, { useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { getMiniCode } from '@server';
import styles from './index.module.scss';
const Index = ({ site, setReady, threadId = '' }) => {
  const [miniCode, setMiniCode] = useState('');
  const defaultLogo = '/dzq-img/default-logo.png';
  const { siteName } = site.webConfig?.setSite || '';
  useEffect(async () => {
    try {
      const threadPath = `/indexPages/thread/index?id=${threadId}`;
      const sitePath = '/indexPages/index/index';
      const path = threadId ? threadPath : sitePath;
      const paramPath = `/pages/index/index?path=${encodeURIComponent(path)}`;
      const res = await getMiniCode({ params: { path: paramPath } });
      if (res?.code === 0) {
        setMiniCode(res?.data.base64Img);
      } else {
        setMiniCode(defaultLogo);
      }
    } catch {
      setMiniCode(defaultLogo);
    }
    setReady(true);
  }, []);
  return (
        <div className={styles.footerBox}>
            <img src={miniCode} className={styles.footerImg}/>
            <span className={styles.desc}>
                长按识别小程序查看详情
            </span>
            <span className={styles.siteName}>
                {`来自${siteName}`}
            </span>
        </div>
  );
};

export default inject('site')(observer(Index));
