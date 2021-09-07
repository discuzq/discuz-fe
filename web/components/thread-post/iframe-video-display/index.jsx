import React from 'react';
import { RichText, Icon } from '@discuzq/design';
import { inject, observer } from 'mobx-react';
import classNames from 'classnames';
import styles from './index.module.scss';

const IframeVideoDisplay = ({
  content,
  whiteList = ['bilibili', 'youku', 'iqiyi', 'music.163.com', 'qq.com', 'em.iq.com', 'xigua', 'myqcloud.com'],
  isDeleteShow = false,
  threadPost,
  h5,
}) => {
  const contentDom = (
    <RichText
      className={styles.richtext}
      content={content}
      iframeWhiteList={whiteList}
      onClick={() => { }}
      onImgClick={() => { }}
      onLinkClick={() => { }}
      transformer={parseDom => parseDom}
    />
  );
  if (!isDeleteShow) return contentDom;
  const styl = h5 ? styles.h5 : styles.pc;
  return (
    <div id="dzq-post-video" className={classNames(styles.wrapper, styl)}>
      {contentDom}
      <div className={styles.wrapper__delete} onClick={() => threadPost.setPostData({ iframe: {} })}>
        <Icon name="DeleteOutlined" />
      </div>
    </div>
  );
};

export default inject('threadPost')(observer(IframeVideoDisplay));
