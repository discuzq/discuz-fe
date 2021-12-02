import { generateImageUrlByHtml, savePic } from './util.js';
import React, { useState, useRef, useEffect } from 'react';
import styles from './index.module.scss';
import { Button, Toast, Checkbox} from '@discuzq/design';
import Footer from './footer';
import Header from '@components/header';
import isWeiXin from '@common/utils/is-weixin';
import { inject, observer } from 'mobx-react';
import SiteCard from './siteCard';
import ThreadCard from './threadCard';
import CommentCard from './commentCard';
import ExperienceCard from './experienceCard';

const Index = ({ card, threadId, user, experience, commentId }) => {
  const [url, setUrl] = useState('');
  const [hidePart, setHidePart] = useState(false);

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

  useEffect(() => {
    if (ready && imgReady) {
      setTimeout(()=>{
        generateImageUrlByHtml(post.current).then((res) => {
          setUrl(res);
        });
      }, 0);
    }
  }, [hidePart]);

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
        {/* {!threadId ? <SiteCard></SiteCard> : <ThreadCard threadId={threadId}></ThreadCard>} */}
        {
          commentId && <CommentCard hidePart={hidePart} commentId={commentId}></CommentCard>
        }
        {
          threadId && !commentId &&  <ThreadCard hidePart={hidePart} threadId={threadId}></ThreadCard>
        }
        {
          experience && !threadId && !commentId && <ExperienceCard setReady={setReady} ></ExperienceCard>
        }
        {
          !threadId && !commentId && !experience && <SiteCard></SiteCard>
        }
        {
          !experience && <Footer setReady={setReady} threadId={threadId} inviteCode={user?.userInfo?.id} commentId={commentId}></Footer>
        }
      </div>
      {ready && imgReady ? (
        <div className={styles.imgbox}>
          <img alt="" className={styles.centImage} src={url} />
        </div>
      ) : (
        <div className={styles.imgbox}></div>
      )}
      <div className={styles.emptyHeight}></div>
      <div className={`${styles.shareBtn} ${(commentId || threadId) && styles.hasHidePart}`}>
        {
          (commentId || threadId) && (
            <div className={styles.checkbox}>
            <Checkbox onChange={()=>setHidePart(!hidePart)} checked={hidePart} >隐藏部分内容</Checkbox>
          </div>
          )
        }
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

export default inject('card', 'user')(observer(Index));
