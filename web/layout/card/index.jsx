import { generateImageUrlByHtml, savePic } from './util.js';
import React, { useState, useRef, useEffect } from 'react';
import styles from './index.module.scss';
import { Button, Toast } from '@discuzq/design';
import Footer from './footer';
import Header from '@components/header';
import isWeiXin from '@common/utils/is-weixin';
import { inject, observer } from 'mobx-react';
import SiteCard from './siteCard';
import ThreadCard from './threadCard';

const Index = ({ card, threadId }) => {
  const [url, setUrl] = useState('');
  const [ready, setReady] = useState(false);
  const post = useRef(null);
  const { imgReady } = card;
  useEffect(() => {
    document.body.className = '';
  }, []);
  useEffect(() => {
    if (ready && imgReady) {
      generateImageUrlByHtml(post.current).then((res) => {
        setUrl(res);
      });
    }
  }, [ready, imgReady]);
  const saveImg = () => {
    savePic(url);
  };
  if (!ready || !imgReady) {
    Toast.loading({ content: '正在绘制...' });
  }

  return (
    <div>
      <Header />
    <div className={styles.contain}>
      <div className={styles.poster} ref={post}>
        {!threadId ? <SiteCard></SiteCard> : <ThreadCard threadId={threadId}></ThreadCard>}
        <Footer setReady={setReady} threadId={threadId}></Footer>
      </div>
      {ready && imgReady ? (
        <div className={styles.imgbox}>
          <img className={styles.centImage} src={url} />
        </div>
      ) : (
        <div className={styles.imgbox}></div>
      )}
      <div className={styles.emptyHeight}></div>
      <div className={styles.shareBtn}>
        {!isWeiXin() ? (
          <Button className={styles.btn} onClick={isWeiXin() ? '' : saveImg}>
            保存到相册
          </Button>
        ) : (
          <div className={styles.wxBtn}>长按图片保存到相册</div>
        )}
      </div>
    </div>
    </div>
  );
};

export default inject('card')(observer(Index));
