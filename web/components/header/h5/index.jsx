import React, { useCallback, useEffect, useRef } from 'react';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';
import { Icon } from '@discuzq/design';
import Router from '@discuzq/sdk/dist/router';
import browser from '@common/utils/browser';
import UnreadRedDot from '@components/unread-red-dot';
import { unreadUpdateInterval } from '@common/constants/message';

const H5Header = (props) => {
  const { allowJump = true, customJum = () => { }, message: { totalUnread, readUnreadCount }, user } = props;
  // todo
  const iconClickHandle = useCallback((link) => {
    if (allowJump) {
      Router.push({ url: link });
      return;
    }
    customJum(link);
  }, []);

  const goBackClickHandle = useCallback(() => {
    if (allowJump) {
      window.history.length <= 1 ? Router.redirect({ url: '/' }) : Router.back();
      return;
    };
    customJum();
  }, []);

  // 轮询更新未读消息
  const timeoutRef = useRef();
  const updateUnreadMessage = () => {
    if (!user.id) return;
    readUnreadCount();
    timeoutRef.current = setTimeout(() => {
      updateUnreadMessage();
    }, unreadUpdateInterval);
  };

  useEffect(() => {
    updateUnreadMessage();
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <div onClick={goBackClickHandle} className={styles.left}>
          <Icon
            className={browser.env('android') ? styles.icon : ''}
            name="LeftOutlined"
            size={16}
          />
          <div className={styles.text}>返回</div>
        </div>
        <div className={styles.right}>
          <Icon
            className={styles.icon}
            onClick={() => iconClickHandle('/')}
            name="HomeOutlined"
          />
          <UnreadRedDot style={{ margin: "0 24px" }} unreadCount={totalUnread}>
            <Icon
              className={styles.icon}
              onClick={() => iconClickHandle('/message')}
              name="MailOutlined"
            />
          </UnreadRedDot>
          <Icon
            className={styles.icon}
            onClick={() => iconClickHandle('/my')}
            name="ProfessionOutlined"
          />
        </div>
      </div>
    </div>
  );
}

export default inject("message", 'user')(observer(H5Header));