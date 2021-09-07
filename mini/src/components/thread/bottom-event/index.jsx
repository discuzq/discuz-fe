import React, { useMemo, useState, useEffect } from 'react';
import styles from './index.module.scss';
import Tip from '../tip';
import Icon from '@discuzq/design/dist/components/icon/index';
import { View, Text } from '@tarojs/components';
import ShareButton from '../share-button';
import goToLoginPage from '@common/utils/go-to-login-page';
import Taro from '@tarojs/taro';
import Toast from '@discuzq/design/dist/components/toast';
import { noop } from '../utils';
/**
 * 帖子底部内容
 * @prop {array}    userImgs 点赞分享用户信息
 * @prop {number}    wholeNum 全部人数
 * @prop {number}    comment 评论人数
 * @prop {number}    sharing 分享人数
 * @prop {number}    onShare 分享事件
 * @prop {number}    onComment 评论事件
 * @prop {number}    onPraise 点赞事件
 */
const Index = ({
  userImgs = [],
  wholeNum = 0,
  comment = 0,
  sharing = 0,
  isLiked = false,
  isSendingLike = false,
  tipData,
  data,
  index,
  user,
  shareThreadid,
  shareNickname,
  shareAvatar,
  getShareData,
  unifyOnClick = null,
  onShare = () => {},
  onComment = () => {},
  onPraise = () => {},
  updateViewCount = noop,
  isCommented = false
}) => {
  const postList = useMemo(() => {
    const praise = {
      icon: 'LikeOutlined',
      name: '赞',
      event: onPraise,
      type: 'like',
      num: wholeNum,
    };

    return [
      praise,
      {
        icon: 'MessageOutlined',
        name: '评论',
        event: onComment,
        type: 'commonet',
        num: comment,
        actived: isCommented,
      },
      {
        icon: 'ShareAltOutlined',
        name: '分享',
        event: onShare,
        type: 'share',
        num: sharing,
      },
    ];
  }, [wholeNum, comment, sharing, isLiked, isCommented]);
  const [show, setShow] = useState(false);
  const handleClickShare = () => {
    updateViewCount();
    // 对没有登录的先登录
    if (!user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/userPages/user/wx-auth/index' });
      return;
    }
    const isApproved = data?.isApproved === 1;
    if (!isApproved) {
      Toast.info({content: '内容正在审核中'});
      return ;
    }
    setShow(true)
  }
  useEffect(() => {
    index.setHiddenTabBar(show);
  }, [show]);
  const needHeight = useMemo(() => userImgs.length !== 0, [userImgs]);
  return (
    <View>
      <View className={needHeight ? styles.user : styles.users}>
        {userImgs.length !== 0 && (
          <View className={styles.userImg}>
            <View className={styles.portrait}>
              <Tip
                tipData={tipData}
                imgs={userImgs}
                wholeNum={wholeNum}
                showCount={5}
                unifyOnClick={unifyOnClick}
                updateViewCount={updateViewCount}
              ></Tip>
            </View>
            {/* {wholeNum !== 0 && <Text className={styles.numText}>{wholeNum}</Text>} */}
          </View>
        )}
        {/* <View className={styles.commentSharing}>
          {comment > 0 && <Text className={styles.commentNum}>{`${comment}条评论`}</Text>}
          {comment > 0 && sharing > 0 && <Text className={styles.division}>·</Text>}
          {sharing > 0 && <Text className={styles.commentNum}>{`${sharing}次分享`}</Text>}
        </View> */}
      </View>

      <View className={needHeight ? styles.operation : styles.operations}>
        {postList.map((item, index) =>
          item.name === '分享' ? (
            <View key={index} className={styles.fabulous} onClick={unifyOnClick || handleClickShare}>
              <View className={styles.fabulousIcon}>
                <Icon className={`${styles.icon} ${item.type}`} name={item.icon} size={16}></Icon>
              </View>
              <Text className={styles.fabulousPost}>{item.num ? item.num : item.name}</Text>
            </View>
          ) : (
            <View key={index} className={styles.fabulous} onClick={unifyOnClick || item.event}>
              <View className={styles.fabulousIcon}>
                <Icon
                  className={`${styles.icon} ${item.type} ${
                    (isLiked && item.name === '赞') || item.actived ? styles.likedColor : styles.dislikedColor
                  }`}
                  name={item.icon}
                  size={16}
                ></Icon>
              </View>
              <Text className={(isLiked && item.name === '赞') || item.actived ? styles.fabulousCancel : styles.fabulousPost}>
                {item.num ? item.num : item.name}
              </Text>
            </View>
          ),
        )}
      </View>
      {show && (
        <ShareButton
          show={show}
          data={data}
          setShow={setShow}
          shareThreadid={shareThreadid}
          shareAvatar={shareAvatar}
          shareNickname={shareNickname}
          getShareData={getShareData}
          onShare={onShare}
        ></ShareButton>
      )}
    </View>
  );
};
export default React.memo(Index);
