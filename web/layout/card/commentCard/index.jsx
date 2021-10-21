import React, { useRef, useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import ImageDisplay from '@components/thread/image-display';
import UserInfo from '@components/thread/user-info';
import styles from './index.module.scss';
import PostContent from '@components/thread/post-content';

const ThreadCard = inject('user', 'card', 'comment')(observer((props) => {
  const { commentDetail: data } = props.comment;
  const { isReady, imgReadyLength, imgReady } = props.card;
  const nickname = data?.user?.nickname;
  const avatar = data.user?.avatar;
  const content = useRef(null);
  const [overMaxHeight, setOverMaxHeight] = useState(false);

  useEffect(() => {
    if (!data?.images || data.images.length === 0) {
        props.card.setImgReady();
    } else if (imgReadyLength === data?.images?.length) {
      props.card.setImgReady();
      props.card.clearImgReadyLength();
    }
    if (imgReady && content?.current?.scrollHeight >= 1900) {
      setOverMaxHeight(true);
    }
  }, []);
  const postLoad = () => {
    props.card.setImgReadyLength();
  };
  const posthandle = str => (str.length > 6 ? `${str.slice(0, 6)}...` : str);


  const filterIframe = /<iframe(([\s\S])*?)<\/iframe>/g; // iframe标签不支持生成h5海报
  return (
    <div>
      {isReady && (
      <div className={`${styles.container}`}>
        <div className={styles.header}>
          <div className={styles.userInfo}>
            <UserInfo
              name={ posthandle(nickname || '')}
              avatar={avatar || ''}
              groupName={data?.user?.groups?.name || ''}
              time={`${data?.createdAt}` || ''}
              userId={data?.user?.id}
            ></UserInfo>
          </div>
        </div>

        <div className={styles.body} ref={content}>

          {/* 文字 */}
          {data.content && <PostContent needShowMore={false} content={data.content.replace(filterIframe, '') || ''} className={styles.content}/>}

          {/* 图片 */}
          {data.images && (
            <ImageDisplay
              flat
              platform="h5"
              imgData={data.images}
              showLongPicture={false}
              postLoad={postLoad}
            />
          )}

        </div>
        {overMaxHeight && (
            <div className={styles.lookmoreBox}>
              <img src="/dzq-img/look-more.jpg" alt="扫码查看更多" className={styles.lookmoreImg}/>
            </div>
        )}
      </div>
      )}

    </div>
  );
}));

export default ThreadCard;

