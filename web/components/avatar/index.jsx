import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Avatar, Button, Icon, Toast } from '@discuzq/design';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import LoadingBox from '@components/loading-box';
import goToLoginPage from '@common/utils/go-to-login-page';
import classNames from 'classnames';

import styles from './index.module.scss';

function avatar(props) {
  const {
    direction = 'right',
    image = '',
    name = '匿',
    onClick = () => {},
    className = '',
    circle = true,
    size = 'primary',
    isShowUserInfo = false,
    userId = null,
    user: myself,
    search,
    userType = -1,
  } = props;

  const userName = useMemo(() => {
    const newName = (name || '').toLocaleUpperCase()[0];
    return newName;
  }, [name]);

  const [isShow, changeIsShow] = useState(false);
  const [userInfo, changeUserInfo] = useState('padding');
  const [following, changeFollowStatus] = useState(false);
  const [blocking, changeBlockStatus] = useState(false);
  const [isSameWithMe, changeIsSameWithMe] = useState(false);

  const onMouseEnterHandler = useCallback(async () => {
    if (!userId) return;
    changeIsShow(true);

    if (!userInfo || userInfo === 'padding') {
      const userInfo = await myself.getAssignUserInfo(userId);
      changeIsSameWithMe(myself?.id === userId);
      changeUserInfo(userInfo);
    }
  });

  const onMouseLeaveHandler = useCallback(() => {
    if (!userId) return;
    changeIsShow(false);
    changeUserInfo('padding');
  });

  const followHandler = useCallback(async (e) => {

    e && e.stopPropagation();

    // 对没有登录的先登录
    if (!myself.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    changeFollowStatus(true);
    if (userInfo.follow === 0) {
      const res = await myself.postFollow(userId);
      if (res.success) {
        const { isMutual = 0 } = res;
        userInfo.follow = isMutual ? 2 : 1;
        userInfo.fansCount = userInfo.fansCount + 1;
        search?.updateActiveUserInfo(userId, { isFollow: true, isMutual: !!isMutual })
      } else {
        Toast.info({ content: res.msg });
      }
    } else {
      const res = await myself.cancelFollow({ id: userId, type: 1 });
      if (res.success) {
        userInfo.follow = 0;
        userInfo.fansCount = userInfo.fansCount - 1;
        search?.updateActiveUserInfo(userId, { isFollow: false, isMutual: false })
      } else {
        Toast.info({ content: res.msg });
      }
    }
    changeFollowStatus(false);
    changeUserInfo({ ...userInfo });
  }, [userInfo]);

  const messagingHandler = useCallback((e) => {

    e && e.stopPropagation();

    // 对没有登录的先登录
    if (!myself.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    const { username, nickname } = userInfo;
    if(username) {
      props.router.push(`/message?page=chat&username=${username}&nickname=${nickname}`);
    } else {
      console.error("用户名错误");
    }
  })

  const blockingHandler = useCallback(async (e) => {

    e && e.stopPropagation();
    // 对没有登录的先登录
    if (!myself.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    changeBlockStatus(true);
    try {
      if (userInfo.isDeny) {
        await myself.undenyUser(userId);
        await myself.setTargetUserNotBeDenied();
        userInfo.isDeny = false;
        Toast.success({
          content: '解除屏蔽成功',
          hasMask: false,
          duration: 1000,
        })
      } else {
        await myself.denyUser(userId);
        await myself.setTargetUserDenied();
        userInfo.isDeny = true;
        Toast.success({
          content: '屏蔽成功',
          hasMask: false,
          duration: 1000,
        })
      }
    } catch (error) {
      console.error(error);
    }
    changeBlockStatus(false);
    changeUserInfo({ ...userInfo });
  }, [userInfo])

  const btnInfo = useMemo(() => {
    const index = userInfo.follow
    if (index === 2) {
      return { text: '互关', icon: 'WithdrawOutlined', className: styles.withdraw }
    }
    if (index === 1) {
      return { text: '已关注', icon: 'CheckOutlined', className: styles.isFollow }
    }
    return { text: '关注', icon: 'PlusOutlined', className: styles.follow }
  }, [userInfo.follow])

  const clickAvatar = useCallback((e) => {
    e.stopPropagation();
    if (!userId) return;
    onClick && onClick(e);
  }, [userId])


  const userInfoBox = useMemo(() => {
    if (!isShowUserInfo || !userId) return null;

    if (userInfo === 'padding') {
      return (
        <div className={styles.userInfoBox} style={direction === 'left' ? {right: 0} : {left: 0}}>
          <div className={styles.userInfoContent}>
            <LoadingBox style={{ minHeight: '100%' }}/>
          </div>
        </div>
      );
    }

    return (
      <div id="avatar-popup" className={`${styles.userInfoBox} ${direction}`} style={direction === 'left' ? {right: 0} : {left: 0}}>
        <div className={styles.userInfoContent}>
          <div className={styles.header}>
            <div className={styles.left} onClick={clickAvatar}>
              <Avatar
                className={classNames(styles.customAvatar, styles.cursor)}
                circle={true}
                image={userInfo.avatarUrl}
                siz='primary'
                text={userInfo.nickname && userInfo.nickname.substring(0, 1)}
              ></Avatar>
            </div>
            <div className={styles.right}>
              <p className={classNames(styles.name, styles.cursor)} onClick={clickAvatar}>{userInfo.nickname}</p>
              <p className={styles.text}>{userInfo.signature && userInfo.signature !== '' ? userInfo.signature : '暂无签名'}</p>
            </div>
          </div>
          <div className={styles.content}>
            <div className={styles.item}>
              <p className={styles.title}>主题</p>
              <p className={styles.text}>{userInfo.threadCount || 0}</p>
            </div>
            <div className={styles.item}>
              <p className={styles.title}>点赞</p>
              <p className={styles.text}>{userInfo.likedCount || 0}</p>
            </div>
            <div className={styles.item}>
              <p className={styles.title}>已关注</p>
              <p className={styles.text}>{userInfo.followCount || 0}</p>
            </div>
            <div className={styles.item}>
              <p className={styles.title}>粉丝</p>
              <p className={styles.text}>{userInfo.fansCount || 0}</p>
            </div>
          </div>
          {
            !isSameWithMe &&
            <div className={styles.footer}>
              <Button
                onClick={following ? () => {} : (e) => followHandler(e)}
                loading={following}
                className={[styles.btn, btnInfo.className]}
                type='primary'>
                  {!following && (
                    <Icon className={styles.icon} name={btnInfo.icon} size={12}/>
                  )}
                  {btnInfo.text}
              </Button>
              <Button
                onClick={(e) => messagingHandler(e)}
                className={[styles.btn, styles.ghost]}
                type='primary' ghost>
                  <Icon className={styles.icon} name="NewsOutlined" size={12}/>发私信
              </Button>
              <Button
                onClick={blocking ? () => {} : (e) => blockingHandler(e)}
                loading={blocking}
                className={`${styles.btn} ${styles.blocked}`}
                type='primary'
              >
                {
                  !blocking &&
                  (
                    <>
                      <Icon className={styles.icon} name="ShieldOutlined" size={12}/>
                      {userInfo.isDeny ? (<span>已屏蔽</span>) : (<span>屏蔽</span>)}
                    </>
                  )
                }
              </Button>
            </div>
          }
        </div>
      </div>
    );
  }, [userInfo, isShowUserInfo, userId]);


  const userTypeIcon =
          (userType === 1) ? "LikeOutlined" :
          (userType === 2) ? "HeartOutlined" :
          (userType === 3) ? "HeartOutlined" : "",
        bgClrBasedOnType =
          (userType === 1) ? styles.like :
          (userType === 2) ? styles.heart :
          (userType === 3) ? styles.heart : "";


  if (image && image !== '') {
    return (
      <div className={styles.avatarBox} onMouseEnter={onMouseEnterHandler} onMouseLeave={onMouseLeaveHandler} >
        <div className={styles.avatarWrapper} onClick={clickAvatar}>
          <Avatar className={className} circle={circle} image={image} size={size}></Avatar>
          {
            userTypeIcon && (
              <div className={`${styles.userIcon} ${bgClrBasedOnType}`}>
                  <Icon name={userTypeIcon} size={12}/>
              </div>
            )
          }
        </div>
        {isShow && userInfoBox}
      </div>
    );
  }

  return (
    <div className={styles.avatarBox} onMouseEnter={onMouseEnterHandler} onMouseLeave={onMouseLeaveHandler}>
      <div className={styles.cursor} onClick={clickAvatar}>
        <Avatar className={className} circle={circle} text={userName} size={size} onClick={clickAvatar}></Avatar>
        {
          userTypeIcon && (
            <div className={`${styles.userIcon} ${bgClrBasedOnType}`}>
                <Icon name={userTypeIcon} size={12}/>
            </div>
          )
        }
      </div>
      {isShow && userInfoBox}
    </div>
  );
}
export default inject('user', 'search')(withRouter(avatar));
