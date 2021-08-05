import React from 'react';
import Router from '@discuzq/sdk/dist/router';
import Toast from '@discuzq/design/dist/components/toast';
import Icon from '@discuzq/design/dist/components/icon';
import { inject, observer } from 'mobx-react';
import BottomEvent from './bottom-event';
import UserInfo from './user-info';
import NoData from '../no-data';
import styles from './index.module.scss';
import goToLoginPage from '@common/utils/go-to-login-page';
import threadPay from '@common/pay-bussiness/thread-pay';
import ThreadCenterView from './ThreadCenterView';
import { debounce, noop , getElementRect, randomStr } from './utils'
import { View, Text } from '@tarojs/components'
import { getImmutableTypeHeight } from './getHeight'

import Skeleton from './skeleton';
import { updateViewCountInStorage } from '@common/utils/viewcount-in-storage';

@inject('site')
@inject('index')
@inject('user')
@inject('thread')
@inject('search')
@inject('topic')
@observer
class Index extends React.Component {

    constructor(props) {
      super(props);

      this.state = {
        isSendingLike: false,
        minHeight: 0,
        useShowMore: true,
        videoH: 0
      }

      this.threadStyleId = `thread-style-id-${randomStr()}`
  }

    componentDidMount() {
      this.changeHeight()
    }

    setUseShowMore = () => {
      this.setState({ useShowMore: false })
    }

    changeHeight = (params) => {
      // 保存视频高度
      const { videoH } = this.state
      if (params?.type === 'video' && videoH === 0) {
        this.setState({ videoH: params.height })
      }

      // 更新帖子组件高度
      getElementRect(this.threadStyleId).then(res => {
        this.setState({ minHeight: res?.height })
      }).catch(() => {
        const height = getImmutableTypeHeight(this.props.data)
        this.setState({ minHeight: height })
      })
    }

    // 评论
    onComment = (e) => {
      e && e.stopPropagation();

      if (!this.allowEnter()) {
        return
      }

      const { threadId = '' } = this.props.data || {};

      if (threadId !== '') {
        this.props.thread.positionToComment()
        Router.push({url: `/indexPages/thread/index?id=${threadId}`})
      } else {
        console.log('帖子不存在');
      }
    }
    // 点赞
    onPraise = (e) => {
      e && e.stopPropagation();
      this.updateViewCount();
      this.handlePraise();
    }

    handlePraise = debounce(() => {

      if(this.state.isSendingLike) return;
      // 对没有登录的先登录
      if (!this.props.user.isLogin()) {
        Toast.info({ content: '请先登录!' });
        goToLoginPage({ url: '/subPages/user/wx-auth/index' });
        return;
      }
      const { data = {}, user } = this.props;
      const { threadId = '', isLike, postId } = data;
      this.setState({ isSendingLike: true });
      this.props.index.updateThreadInfo({ pid: postId, id: threadId, data: { attributes: { isLiked: !isLike } } }).then((result) => {
        if (result.code === 0 && result.data) {
          this.props.index.updateAssignThreadInfo(threadId, { updateType: 'like', updatedInfo: result.data, user: user.userInfo });
          this.props.search.updateAssignThreadInfo(threadId, { updateType: 'like', updatedInfo: result.data, user: user.userInfo });
          this.props.topic.updateAssignThreadInfo(threadId, { updateType: 'like', updatedInfo: result.data, user: user.userInfo });
          this.props.user.updateAssignThreadInfo(threadId, { updateType: 'like', updatedInfo: result.data, user: user.userInfo });
        }
        this.setState({ isSendingLike: false, minHeight: 0 }, () => {
          // 点赞更新完数据后，重新修正帖子高度
          this.changeHeight()
        });
      });
    }, 1000)

    // 支付
    onPay = (e) => {
      // e && e.stopPropagation();
      this.updateViewCount();
      this.handlePay();
    }
    handlePay = debounce(async (e) => {
      // e && e.stopPropagation();

      // 对没有登录的先做
      if (!this.props.user.isLogin()) {
        Toast.info({ content: '请先登录!' });
        goToLoginPage({ url: '/subPages/user/wx-auth/index' });
        return;
      }

      if (this.props.payType === '0') {
        return;
      }

      const thread = this.props.data;
      const { success } = await threadPay(thread, this.props.user?.userInfo);

      // 支付成功重新请求帖子数据
      if (success && thread?.threadId) {
        const { code, data } = await this.props.thread.fetchThreadDetail(thread?.threadId);
        if (code === 0 && data) {
          this.props.index.updatePayThreadInfo(thread?.threadId, data);
          this.props.search.updatePayThreadInfo(thread?.threadId, data);
          this.props.topic.updatePayThreadInfo(thread?.threadId, data);
          this.props.user.updatePayThreadInfo(thread?.threadId, data);

          if(typeof this.props.dispatch === "function") {
            this.props.dispatch(thread?.threadId, data);
          }
        }
      }
    }, 1000);

    onClick = (e) => {
      if (!this.allowEnter()) {
        return
      }

      const { threadId = '' } = this.props.data || {};

      if (threadId !== '') {
        this.props.thread.isPositionToComment = false;
        Router.push({url: `/indexPages/thread/index?id=${threadId}`})

      } else {
        console.log('帖子不存在');
      }

      // 执行外部传进来的点击事件
      const { onClick } = this.props;
      if (typeof(onClick) === 'function') {
        onClick(this.props.data);
      }
    }

    onUser = (e) => {
      e && e.stopPropagation();

      const { user = {}, isAnonymous } = this.props.data || {};
      if (!!isAnonymous) {
        this.onClick()
      } else {
        Router.push({url: `/subPages/user/index?id=${user?.userId}`});
      }
    }

    onClickHeaderIcon = (e) => {
      e && e.stopPropagation();

      const { onClickIcon = noop } = this.props;
      onClickIcon(e)
    }

    // 判断能否进入详情逻辑
    allowEnter = () => {
      const { ability } = this.props.data || {};
      const { canViewPost } = ability;

      if (!canViewPost) {
        const isLogin = this.props.user.isLogin()
        if (!isLogin) {
          Toast.info({ content: '请先登录!' });
          goToLoginPage({ url: '/user/login' });
        } else {
          Toast.info({ content: '暂无权限查看详情，请联系管理员' });
        }
        return false
      }
      return true
    }

    updateViewCount = async () => {
      const { data, site } = this.props;
      const { threadId = '' } = data || {};
      const { openViewCount } = site?.webConfig?.setSite || {};

      const viewCountMode = Number(openViewCount);
      if(viewCountMode === 1) return;

      const threadIdNumber = Number(threadId);
      const viewCount = await updateViewCountInStorage(threadIdNumber);
      if(viewCount) {
        this.props.index.updateAssignThreadInfo(threadIdNumber, { updateType: 'viewCount', updatedInfo: { viewCount } })
        this.props.search.updateAssignThreadInfo(threadIdNumber, { updateType: 'viewCount', updatedInfo: { viewCount } })
        this.props.topic.updateAssignThreadInfo(threadIdNumber, { updateType: 'viewCount', updatedInfo: { viewCount } })
      }
    }

    render() {
      const { data, className = '', site = {}, showBottomStyle = true, isShowIcon = false, unifyOnClick = null, relativeToViewport = true } = this.props;
      const { platform = 'pc' } = site;
      if (!data) {
        return <NoData />;
      }
      const {
        user = {},
        position = {},
        likeReward = {},
        viewCount,
        group,
        createdAt,
        isLike,
        postId,
        threadId,
        displayTag,
        payType,
        content,
        isAnonymous,
        diffTime
      } = data || {};
      const {text} = content
      const { isEssence, isPrice, isRedPack, isReward } = displayTag;
      const {getShareData, getShareContent} = this.props.user
      const {shareNickname, shareAvatar, shareThreadid, shareContent} = this.props.user
      const { minHeight, useShowMore, videoH } = this.state
      return (
        <View className={`${styles.container} ${className} ${showBottomStyle && styles.containerBottom} ${platform === 'pc' && styles.containerPC}`} style={{ minHeight: `${minHeight}px` }} id={this.threadStyleId}>
          {
          relativeToViewport ? (
            <>
            <View className={styles.header} onClick={unifyOnClick || this.onClick}>
                <UserInfo
                  name={user.nickname || ''}
                  avatar={user.avatar || ''}
                  location={position.location}
                  view={`${viewCount}`}
                  groupName={group?.groupName}
                  time={diffTime}
                  isEssence={isEssence}
                  isPay={isPrice}
                  isRed={isRedPack}
                  isReward={isReward}
                  isAnonymous={isAnonymous}
                  userId={user?.userId}
                  platform={platform}
                  onClick={unifyOnClick || this.onUser}
                />
                {isShowIcon && <View className={styles.headerIcon} onClick={unifyOnClick || this.onClickHeaderIcon}><Icon name='CollectOutlinedBig' className={styles.collectIcon}></Icon></View>}
            </View>

            <ThreadCenterView
              text={text}
              data={data}
              onClick={unifyOnClick || this.onClick}
              onPay={unifyOnClick || this.onPay}
              platform={platform}
              relativeToViewport={relativeToViewport}
              changeHeight={this.changeHeight}
              useShowMore={useShowMore}
              setUseShowMore={this.setUseShowMore}
              videoH={videoH}
              updateViewCount={this.updateViewCount}
            />

            <BottomEvent
              userImgs={likeReward.users}
              wholeNum={likeReward.likePayCount || 0}
              comment={likeReward.postCount || 0}
              sharing={likeReward.shareCount || 0}
              // onShare={this.onShare}
              onComment={this.onComment}
              onPraise={this.onPraise}
              unifyOnClick={unifyOnClick}
              isLiked={isLike}
              isSendingLike={this.state.isSendingLike}
              tipData={{ postId, threadId, platform, payType }}
              platform={platform}
              index={this.props.index}
              shareNickname = {shareNickname}
              shareAvatar = {shareAvatar}
              shareThreadid = {shareThreadid}
              getShareData = {getShareData}
              shareContent = {shareContent}
              getShareContent = {getShareContent}
              data={data}
              user={this.props.user}
              updateViewCount={this.updateViewCount}
              setVisible={this.props.setVisible}
              setData={this.props.setData}
            />
            </>
          ) : <Skeleton style={{ minHeight: `${minHeight}px` }} />
        }
        </View>
      );
    }
}

// eslint-disable-next-line new-cap
export default Index;
