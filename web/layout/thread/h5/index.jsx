import React, { Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import Router from '@discuzq/sdk/dist/router';

import layout from './layout.module.scss';
import footer from './footer.module.scss';

import NoMore from './components/no-more';
import LoadingTips from '@components/thread-detail-pc/loading-tips';

// import styleVar from '@common/styles/theme/default.scss.json';
import { Icon, Input, Toast } from '@discuzq/design';
import Header from '@components/header';
import goToLoginPage from '@common/utils/go-to-login-page';

import ReportPopup from './components/report-popup';
import ShowTop from './components/show-top';
import DeletePopup from '@components/thread-detail-pc/delete-popup';
import MorePopup from './components/more-popup';
import InputPopup from './components/input-popup';
import throttle from '@common/utils/thottle';
import { debounce } from '@common/utils/throttle-debounce';
import { debounce as immediateDebounce } from '@components/thread/utils';
import h5Share from '@discuzq/sdk/dist/common_modules/share/h5';
import threadPay from '@common/pay-bussiness/thread-pay';
import RewardPopup from './components/reward-popup';
import SharePopup from '@components/thread/share-popup';
import isWeiXin from '@common/utils/is-weixin';

import RenderThreadContent from './content';
import RenderCommentList from './comment-list';
import classNames from 'classnames';

import BottomView from '@components/list/BottomView';
import Copyright from '@components/copyright';

import MorePopop from '@components/more-popop';

import HOCTencentCaptcha from '@middleware/HOCTencentCaptcha';

import { parseContentData } from '../utils';
const hongbaoMini = 'https://cloudcache.tencentcs.com/operation/dianshi/other/redpacket-mini.10b46eefd630a5d5d322d6bbc07690ac4536ee2d.png';

@inject('site')
@inject('user')
@inject('thread')
@inject('commentPosition')
@inject('comment')
@inject('index')
@inject('card')
@inject('vlist')
@observer
class ThreadH5Page extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loadWeiXin: false,
      isShowWeiXinShare: false, // ???????????????????????????????????????
      showReportPopup: false, // ????????????????????????
      showDeletePopup: false, // ????????????????????????
      showCommentInput: false, // ?????????????????????
      showMorePopup: false, // ?????????????????????
      showRewardPopup: false, // ????????????
      isCommentLoading: false, // ??????loading
      setTop: false, // ??????
      showContent: '',
      // inputValue: '', // ????????????
      show: false, // ??????????????????
      stateFlag: !this.props.thread?.isPositionToComment,
      contentImgIsReady: false, // ????????????????????????????????????
    };

    this.perPage = 20;
    this.commentDataSort = true;

    // ????????????????????????
    this.threadBodyRef = React.createRef();
    this.commentDataRef = React.createRef();
    this.position = 0;
    this.nextPosition = 0;
    this.flag = !this.props.thread?.isPositionToComment;
    this.isFirst = true;
    // ??????????????????
    this.comment = null;

    // ??????????????????
    this.reportContent = ['????????????', '????????????', '????????????', '????????????'];
    this.inputText = '????????????...';

    this.positionRef = React.createRef();
    this.isPositioned = false;
  }

  // ????????????
  handleOnScroll() {
    // ??????????????????
    const scrollDistance = this.threadBodyRef?.current?.scrollTop;
    const offsetHeight = this.threadBodyRef?.current?.offsetHeight;
    const scrollHeight = this.threadBodyRef?.current?.scrollHeight;
    const { isCommentReady, isNoMore } = this.props.thread;
    // ???????????????????????????
    this.props.thread.setScrollDistance(scrollDistance);
    if (scrollDistance + offsetHeight >= scrollHeight && !this.state.isCommentLoading && isCommentReady && !isNoMore) {
      this.props.thread.setCommentListPage(this.props.thread.page + 1);
      this.loadCommentList();
    }

    if (this.flag) {
      this.nextPosition = this.threadBodyRef?.current?.scrollTop || 0;
    }
  }

  componentDidMount() {
    this.setState({ loadWeiXin: isWeiXin() });
  }
  componentDidUpdate() {
    if (!this.isFirst) {
      return;
    }
    const { thread } = this.props;
    // ???????????????????????????
    if (this.state.contentImgIsReady) {
      this.isFirst = false;
      // ?????????????????????????????????????????????????????????
      this.position = this.commentDataRef?.current?.offsetTop - 50;
      thread.clearContentImgState();
      // ???????????????????????????
      if (this.props?.thread?.isPositionToComment) {
        // TODO:??????????????????????????????????????????
        setTimeout(() => {
          this.threadBodyRef?.current?.scrollTo(0, this.position);
        }, 1000);
        return;
      }
      // ??????????????????????????????
      this.threadBodyRef.current.scrollTo(0, this.props.thread.scrollDistance);
    }

    // ????????????????????????????????????
    if (this.props.commentPosition?.postId && !this.isPositioned && this.positionRef?.current) {
      this.isPositioned = true;
      setTimeout(() => {
        this.positionRef.current.scrollIntoView();
      }, 1000);
    }
  }

  componentWillUnmount() {
    // ????????????
    // this.props?.thread && this.props.thread.reset();
  }
  setContentImgReady = () => {
    this.setState({ contentImgIsReady: true });
  };
  // ????????????icon
  onMessageClick() {
    const position = this.flag ? this.position : 0;
    this.flag = !this.flag;
    this.setState({ stateFlag: this.flag });
    this.threadBodyRef.current.scrollTo(0, position);
  }

  // ????????????icon
  async onCollectionClick() {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '????????????!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    const id = this.props.thread?.threadData?.id;
    const params = {
      id,
      isFavorite: !this.props.thread?.isFavorite,
    };
    const { success, msg } = await this.props.thread.updateFavorite(params);

    if (success) {
      Toast.success({
        content: params.isFavorite ? '????????????' : '????????????',
      });
      return;
    }

    Toast.error({
      content: msg,
    });
  }

  // ???????????????????????????
  async loadCommentList() {
    const { isCommentReady } = this.props.thread;
    if (this.state.isCommentLoading || !isCommentReady) {
      return;
    }

    this.setState({
      isCommentLoading: true,
    });
    const id = this.props.thread?.threadData?.id;
    const params = {
      id,
      page: this.props.thread.page,
      perPage: this.perPage,
      sort: this.commentDataSort ? 'createdAt' : '-createdAt',
    };

    const { success, msg } = await this.props.thread.loadCommentList(params);
    this.setState({
      isCommentLoading: false,
    });
    if (success) {
      return true;
    }
    Toast.error({
      content: msg,
    });
  }

  // ????????????
  onSortChange(isCreateAt) {
    this.commentDataSort = isCreateAt;
    this.props.thread.setCommentListPage(1);
    this.props.commentPosition.reset();
    return this.loadCommentList();
  }

  // ????????????
  onInputClick() {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '????????????!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }
    if (!this.props.canPublish('reply')) return;
    this.setState({
      showCommentInput: true,
    });
  }

  // onUserClick(userId) {
  //   if (!userId) return;
  //   Router.push({ url: `/user/${userId}` });
  // }

  // ????????????icon
  onMoreClick = () => {
    // this.setState({
    //   text: !this.state.text,
    // });
    this.setState({ showMorePopup: true });
  };

  onOperClick = (type) => {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '????????????!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    this.setState({ showMorePopup: false });

    // ??????
    if (type === 'stick') {
      this.updateStick();
    }

    // ??????
    if (type === 'essence') {
      this.updateEssence();
    }

    // ??????
    if (type === 'delete') {
      this.setState({ showDeletePopup: true });
    }

    // ??????
    if (type === 'edit') {
      if (!this.props.thread?.threadData?.id) return;
      Router.push({ url: `/thread/post?id=${this.props.thread?.threadData?.id}` });
    }

    // ??????
    if (type === 'report') {
      this.setState({ showReportPopup: true });
    }

    // ??????
    if (type === 'collect') {
      this.onCollectionClick();
    }

    // ????????????
    if (type === 'wxshare') {
      this.onShareClick();
    }

    // ????????????
    if (type === 'copylink') {
      this.handleH5Share();
    }

    // ??????
    if (type === 'post') {
      this.createCard();
    }
  };

  // ????????????
  async onReportOk(val) {
    if (!val) return;

    const params = {
      threadId: this.props.thread.threadData.threadId,
      type: 1,
      reason: val,
      userId: this.props.user.userInfo.id,
    };
    const { success, msg } = await this.props.thread.createReports(params);

    if (success) {
      Toast.success({
        content: '????????????',
      });

      this.setState({ showReportPopup: false });
      return true;
    }

    Toast.error({
      content: msg,
    });
  }

  // ????????????
  setTopState(isStick) {
    this.setState({
      showContent: isStick,
      setTop: !this.state.setTop,
    });
    setTimeout(() => {
      this.setState({ setTop: !this.state.setTop });
    }, 2000);
  }

  // ????????????
  async updateStick() {
    const id = this.props.thread?.threadData?.id;
    const params = {
      id,
      isStick: !this.props.thread?.threadData?.isStick,
    };
    const { success, msg } = await this.props.thread.updateStick(params);

    if (success) {
      this.setTopState(params.isStick);
      // ????????????????????????
      this.props?.index?.refreshHomeData && this.props.index.refreshHomeData();
      return;
    }

    Toast.error({
      content: msg,
    });
  }

  // ????????????
  async updateEssence() {
    const id = this.props.thread?.threadData?.id;
    const params = {
      id,
      isEssence: !this.props.thread?.threadData?.displayTag?.isEssence,
    };
    const { success, msg } = await this.props.thread.updateEssence(params);

    // ????????????store??????
    this.props.thread.updateListStore();

    if (success) {
      Toast.success({
        content: '????????????',
      });
      return;
    }

    Toast.error({
      content: msg,
    });
  }

  // ??????????????????
  async delete() {
    this.setState({ showDeletePopup: false });
    const id = this.props.thread?.threadData?.id;

    const { success, msg } = await this.props.thread.delete(id);

    if (success) {
      Toast.success({
        content: '????????????????????????????????????',
      });
      this.props.index.deleteThreadsData({ id }, this.props.site);
      setTimeout(() => {
        Router.push({ url: '/' });
      }, 1000);

      return;
    }

    Toast.error({
      content: msg,
    });
  }

  onBtnClick() {
    this.delete();
    this.setState({ showDeletePopup: false });
  }

  // ??????????????????
  async onPublishClick(val = '', imageList = []) {
    const valuestr = val.replace(/\s/g, '');
    // ????????????????????????????????????????????????
    if (!valuestr && imageList.length === 0) {
      Toast.info({ content: '???????????????' });
      return;
    }

    const params = {
      val,
      imageList,
    }

    // ?????????
    const { webConfig } = this.props.site;
    if (webConfig) {
      const qcloudCaptcha = webConfig?.qcloud?.qcloudCaptcha;
      const createThreadWithCaptcha = webConfig?.other?.createThreadWithCaptcha;
      // ?????????????????????????????????????????????????????????????????????????????????????????????

      if (qcloudCaptcha && createThreadWithCaptcha) {
        // ?????????????????????????????????????????????????????????????????????
        const { captchaTicket, captchaRandStr } = await this.props.showCaptcha();
        if (!captchaTicket && !captchaRandStr) {
          return false ;
        }
        params.captchaTicket = captchaTicket;
        params.captchaRandStr = captchaRandStr;
      }
    }

    return this.comment ? await this.updateComment(params) : await this.createComment(params);
  }

  // ????????????
  async createComment({val, imageList, captchaTicket = '', captchaRandStr = ''}) {
    const id = this.props.thread?.threadData?.id;
    const params = {
      id,
      content: val,
      sort: this.commentDataSort, // ???????????????
      isNoMore: this.props?.thread?.isNoMore,
      attachments: [],
      captchaTicket,
      captchaRandStr,
    };

    if (imageList?.length) {
      params.attachments = imageList
        .filter(item => item.status === 'success' && item.response)
        .map((item) => {
          const { id } = item.response;
          return {
            id,
            type: 'attachments',
          };
        });
    }

    const { success, msg, isApproved, redPacketAmount } = await this.props.comment.createComment(params, this.props.thread);
    if (success) {
      // ??????????????????????????????
      this.props.thread.updatePostCount(this.props.thread.totalCount);
      // ????????????store??????
      this.props.thread.updateListStore();

      // ???????????????
      const isRedPack = this.props.thread?.threadData?.displayTag?.isRedPack;
      // TODO:??????????????????????????????????????????????????????
      if (isRedPack) {
        // ??????????????????????????????????????????
        this.props.thread.fetchThreadDetail(id);
      }

      if (redPacketAmount && redPacketAmount > 0) {
        this.props.thread.setRedPacket(redPacketAmount);
      }

      if (isApproved) {
        Toast.success({
          content: msg,
        });
      } else {
        Toast.warning({
          content: msg,
        });
      }

      this.setState({
        showCommentInput: false,
      });
      return true;
    }
    Toast.error({
      content: msg,
    });
  }

  // ????????????
  async updateComment({val, captchaTicket = '', captchaRandStr = ''}) {
    if (!this.comment) return;

    const id = this.props.thread?.threadData?.id;
    const params = {
      id,
      postId: this.comment.id,
      content: val,
      attachments: [],
      captchaTicket,
      captchaRandStr,
    };
    const { success, msg, isApproved } = await this.props.comment.updateComment(params, this.props.thread);
    if (success) {
      if (isApproved) {
        Toast.success({
          content: msg,
        });
      } else {
        Toast.warning({
          content: msg,
        });
      }
      this.setState({
        showCommentInput: false,
      });
      return true;
    }
    Toast.error({
      content: msg,
    });
  }

  // ??????????????????
  onEditClick(comment) {
    this.comment = comment;
    this.setState({
      inputValue: comment.content,
      showCommentInput: true,
    });
  }

  // ???????????????
  onClose() {
    this.setState({
      showCommentInput: false,
    });
    this.comment = null;
  }

  // ??????
  async onLikeClick() {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '????????????!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    const id = this.props.thread?.threadData?.id;
    const params = {
      id,
      pid: this.props.thread?.threadData?.postId,
      isLiked: !this.props.thread?.threadData?.isLike,
    };
    const { success, msg } = await this.props.thread.updateLiked(
      params,
      this.props.index,
      this.props.user,
    );

    if (!success) {
      Toast.error({
        content: msg,
      });
    }
  }

  // ??????
  async onShareClick() {
    // ??????????????????????????????
    if (!isWeiXin()) return;
    this.setState({ isShowWeiXinShare: true });
    const data = this.props.thread.threadData;
    const threadId = data.id;
    const { success, msg } = await this.props.thread.shareThread(threadId, this.props.index, this.props.search, this.props.topic);
    if (!success) {
      Toast.error({
        content: msg,
      });
    }
  }
  handleClick = () => {
    const { user } = this.props;
    if (!user.isLogin()) {
      goToLoginPage({ url: '/user/login' });
      return;
    }
    this.setState({ show: true });
  };
  onShareClose = () => {
    this.setState({ show: false });
  };
  handleH5Share = async () => {
    Toast.info({ content: '??????????????????' });

    this.onShareClose();

    const { title = '' } = this.props.thread?.threadData || {};
    h5Share({ title, path: `thread/${this.props.thread?.threadData?.threadId}` });

    const id = this.props.thread?.threadData?.id;

    const { success, msg } = await this.props.thread.shareThread(id, this.props.index, this.props.search, this.props.topic);

    if (!success) {
      Toast.error({
        content: msg,
      });
    }
  };
  handleWxShare = () => {
    this.setState({ isShowWeiXinShare: true });
    this.onShareClose();
    this.onShareClick();
  };
  createCard = async () => {
    const data = this.props.thread.threadData;
    const threadId = data.id;
    const { card } = this.props;

    const { success, msg } = await this.props.thread.shareThread(threadId, this.props.index, this.props.search, this.props.topic);
    if (!success) {
      Toast.error({
        content: msg,
      });
    }

    card.setThreadData(data);
    Router.push({ url: `/card?threadId=${threadId}` });
  };
  // ????????????
  async onPayClick() {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '????????????!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    const thread = this.props.thread.threadData;
    const { success } = await threadPay(thread, this.props.user?.userInfo);

    // ????????????????????????????????????
    if (success && this.props.thread?.threadData?.threadId) {
      await this.props.thread.fetchThreadDetail(this.props.thread?.threadData?.threadId);
      // ????????????store??????
      this.props.thread.updateListStore();
    }
  }

  // ????????????
  onRewardClick() {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '????????????!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    this.setState({ showRewardPopup: true });
  }

  // ????????????
  async onRewardSubmit(value) {
    if (!isNaN(Number(value)) && this.props.thread?.threadData?.threadId && this.props.thread?.threadData?.userId) {
      this.setState({ showRewardPopup: false });
      const params = {
        amount: Number(value),
        threadId: this.props.thread.threadData.threadId,
        payeeId: this.props.thread.threadData.userId,
        title: this.props.thread?.threadData?.title || '????????????',
      };

      const { success, msg } = await this.props.thread.rewardPay(
        params,
        this.props.user,
      );

      if (!success) {
        Toast.error({
          content: msg,
        });
      }
    }
  }

  // ???????????? TODO:????????????
  onTagClick() {
    // TODO:????????????????????????????????????????????????????????????
    const categoryId = this.props.thread?.threadData?.categoryId;
    if (categoryId || typeof categoryId === 'number') {
      this.props.index.refreshHomeData({ categoryIds: [categoryId] });
    }
    this.props.vlist.resetPosition();
    Router.push({ url: `/cate/${categoryId}/seq/0` });
  }

  replyAvatarClick(reply, comment, floor) {
    if (floor === 2) {
      const { userId } = reply;
      if (!userId) return;
      Router.push({ url: `/user/${userId}` });
    }
    if (floor === 3) {
      const { commentUserId } = reply;
      if (!commentUserId) return;
      Router.push({ url: `/user/${commentUserId}` });
    }
  }

  onUserClick(e) {
    const { threadData } = this.props.thread || {};
    const useId = threadData?.user?.userId;
    if (!useId) return;
    Router.push({ url: `/user/${threadData?.user?.userId}` });
  }

  // ??????????????????
  onLoadMoreClick() {
    this.props.commentPosition.page = this.props.commentPosition.page + 1;
    this.loadCommentPositionList();
  }

  // ???????????????????????????
  async loadCommentPositionList() {
    const { isCommentReady } = this.props.commentPosition;
    if (this.state.isCommentLoading || !isCommentReady) {
      return;
    }

    this.setState({
      isCommentLoading: true,
    });
    const id = this.props.thread?.threadData?.id;
    const params = {
      id,
      page: this.props?.commentPosition?.page || 1,
      perPage: this.perPage,
      sort: this.commentDataSort ? 'createdAt' : '-createdAt',
    };

    const { success, msg } = await this.props.commentPosition.loadCommentList(params);
    this.setState({
      isCommentLoading: false,
    });
    if (success) {
      return true;
    }
    Toast.error({
      content: msg,
    });
  }


  render() {
    const { thread: threadStore } = this.props;
    const { isReady, isCommentReady, isNoMore, totalCount, isCommentListError } = threadStore;
    const { indexes } = threadStore?.threadData?.content || {};
    const { RED_PACKET } = parseContentData(indexes);
    const hasHongbao = RED_PACKET?.condition === 0 && RED_PACKET?.remainNumber > 0; // ??????s?????????????????????????????????????????????

    const fun = {
      moreClick: this.onMoreClick,
    };


    // const isDraft = threadStore?.threadData?.isDraft;
    // // ???????????????
    // const isRedPack = threadStore?.threadData?.displayTag?.isRedPack;
    // // ???????????????
    // const isReward = threadStore?.threadData?.displayTag?.isReward;

    // ??????????????????
    const morePermissions = {
      // ??????????????? && ??????????????? && ??????????????? && ?????????????????? || ???????????? && ??????????????????
      // canEdit:
      //   (!isDraft && threadStore?.threadData?.ability?.canEdit && !isRedPack && !isReward)
      //   || (isDraft && threadStore?.threadData?.ability?.canEdit),
      canEdit: threadStore?.threadData?.ability?.canEdit, // ?????????????????????????????????????????????????????????????????????
      canDelete: threadStore?.threadData?.ability?.canDelete,
      canEssence: threadStore?.threadData?.ability?.canEssence,
      canStick: threadStore?.threadData?.ability?.canStick,
      canShare: this.props.user.isLogin(),
      canWxShare: this.props.user.isLogin() && isWeiXin(),
      canCollect: this.props.user.isLogin(),
      isAdmini: this.props?.user?.isAdmini,
    };
    // ??????????????????
    const moreStatuses = {
      isEssence: threadStore?.threadData?.displayTag?.isEssence,
      isStick: threadStore?.threadData?.isStick,
      isCollect: threadStore?.isFavorite,
    };

    // ??????????????????
    const isApproved = (threadStore?.threadData?.isApproved || 0) === 1;

    // ??????????????????
    const { isShowCommentList, isNoMore: isCommentPositionNoMore } = this.props.commentPosition;

    return (
      <div className={layout.container}>
        <div className={layout.header}>
          <Header></Header>
          {isReady && !isApproved && (
            <div className={layout.examine}>
              <Icon className={layout.tipsIcon} name="TipsOutlined"></Icon>
              <span className={layout.tipsText}>????????????????????????????????????????????????????????????</span>
            </div>
          )}
        </div>
        <div
          className={layout.body}
          ref={this.threadBodyRef}
          // onScrollCapture={() => throttle(this.handleOnScroll, 3000)}
          onScrollCapture={throttle(() => this.handleOnScroll(), 1000)}
        >
          <ShowTop showContent={this.state.showContent} setTop={this.state.setTop}></ShowTop>
          {/* ???????????? */}
          {isReady ? (
            <RenderThreadContent
              store={threadStore}
              setContentImgReady={this.setContentImgReady}
              fun={fun}
              onLikeClick={() => this.onLikeClick()}
              onOperClick={type => this.onOperClick(type)}
              onCollectionClick={() => this.onCollectionClick()}
              onReportClick={() => this.onReportClick()}
              onRewardClick={() => this.onRewardClick()}
              onTagClick={() => this.onTagClick()}
              onPayClick={() => this.onPayClick()}
              // onPayClick={() => this.onPayClick()}
              onUserClick={e => this.onUserClick(e)}
            ></RenderThreadContent>
          ) : (
            <LoadingTips type="init"></LoadingTips>
          )}

          {/* ???????????? */}
          {isReady && isApproved && (
            <div className={`${layout.bottom}`} ref={this.commentDataRef}>
              {isCommentReady ? (
                <Fragment>
                  {/* ??????????????? */}
                  {isCommentReady && isShowCommentList && (
                    <Fragment>
                      <RenderCommentList
                        isPositionComment={true}
                        sort={flag => this.onSortChange(flag)}
                        replyAvatarClick={(comment, reply, floor) => this.replyAvatarClick(comment, reply, floor)}
                      ></RenderCommentList>
                      {!isCommentPositionNoMore && (
                      // <BottomView
                      //   onClick={() => this.onLoadMoreClick()}
                      //   noMoreType="line"
                      //   loadingText="??????????????????"
                      //   isError={isCommentListError}
                      //   noMore={isCommentPositionNoMore}
                      // ></BottomView>

                        <div className={layout.showMore} onClick={() => this.onLoadMoreClick()}>
                          <div className={layout.hidePercent}>??????????????????</div>
                          <Icon className={layout.icon} name="RightOutlined" size={12} />
                        </div>
                      )}
                    </Fragment>
                  )}

                  {/* ??????????????? */}
                  <RenderCommentList
                    canPublish={this.props.canPublish}
                    positionRef={this.positionRef}
                    showHeader={!isShowCommentList}
                    sort={flag => this.onSortChange(flag)}
                    onEditClick={comment => this.onEditClick(comment)}
                    replyAvatarClick={(comment, reply, floor) => this.replyAvatarClick(comment, reply, floor)}
                  ></RenderCommentList>
                  <BottomView noMoreType="line" isError={isCommentListError} noMore={isNoMore}></BottomView>
                </Fragment>
              ) : (
                <LoadingTips isError={isCommentListError} type="init"></LoadingTips>
              )}
            </div>
          )}
          <Copyright marginTop={0} />
        </div>

        {/* ??????????????? */}
        {isReady && isApproved && (
          <div className={layout.footerContainer}>
            <div className={layout.footer}>
              {/* ??????????????? */}
              <div
                className={classNames(footer.inputClick, hasHongbao && footer.hasHongbao)}
                onClick={() => this.onInputClick()}
              >
                {hasHongbao && <img className={footer.hongbaoMini} src={hongbaoMini}></img>}
                <Input className={footer.input} placeholder="?????????" disabled={true} prefixIcon="EditOutlined"></Input>
              </div>

              {/* ????????? */}
              <div className={footer.operate}>
                <div className={footer.icon} onClick={() => this.onMessageClick()}>
                  {this.state.stateFlag
                    ? totalCount > 0 ? (
                      <div className={classNames(footer.badge, totalCount < 10 && footer.isCricle)}>
                        {totalCount > 99 ? '99+' : `${totalCount || '0'}`}
                      </div>
                    ) : (
                      ''
                    ) : (
                      <div className={footer.content}>
                        ??????
                      </div>
                    )}
                  <Icon size="20" name="MessageOutlined"></Icon>
                </div>
                <Icon
                  className={classNames(footer.icon, {
                    [footer.isliked]: this.props.thread?.threadData?.isLike,
                  })}
                  onClick={debounce(() => this.onLikeClick(), 500)}
                  size="20"
                  name="LikeOutlined"
                ></Icon>
                <Icon
                  className={classNames(footer.icon, {
                    [footer.isliked]: this.props.thread?.isFavorite,
                  })}
                  onClick={debounce(() => this.onCollectionClick(), 500)}
                  size="20"
                  name="CollectOutlinedBig"
                ></Icon>
                <Icon
                  onClick={immediateDebounce(() => this.handleClick(), 1000)}
                  className={footer.icon}
                  size="20"
                  name="ShareAltOutlined"
                ></Icon>
              </div>
            </div>
          </div>
        )}
        <MorePopop
          show={this.state.show}
          onClose={this.onShareClose}
          handleH5Share={this.handleH5Share}
          handleWxShare={this.handleWxShare}
          createCard={this.createCard}
        ></MorePopop>
        {isReady && (
          <Fragment>
            {/* ???????????? */}
            <InputPopup
              visible={this.state.showCommentInput}
              onClose={() => this.onClose()}
              initValue={this.state.inputValue}
              onSubmit={(value, imgList) => this.onPublishClick(value, imgList)}
              site={this.props.site}
            ></InputPopup>

            {/* ???????????? */}
            <MorePopup
              permissions={morePermissions}
              statuses={moreStatuses}
              visible={this.state.showMorePopup}
              onClose={() => this.setState({ showMorePopup: false })}
              onSubmit={() => this.setState({ showMorePopup: false })}
              onOperClick={type => this.onOperClick(type)}
            ></MorePopup>

            {/* ???????????? */}
            <DeletePopup
              visible={this.state.showDeletePopup}
              onClose={() => this.setState({ showDeletePopup: false })}
              onBtnClick={type => this.onBtnClick(type)}
              type='thread'
            ></DeletePopup>
            {/* ???????????? */}

            {/* ???????????? */}
            <ReportPopup
              reportContent={this.reportContent}
              inputText={this.inputText}
              visible={this.state.showReportPopup}
              onCancel={() => this.setState({ showReportPopup: false })}
              onOkClick={data => this.onReportOk(data)}
            ></ReportPopup>

            {/* ???????????? */}
            <RewardPopup
              visible={this.state.showRewardPopup}
              onCancel={() => this.setState({ showRewardPopup: false })}
              onOkClick={value => this.onRewardSubmit(value)}
            ></RewardPopup>

            {/* ?????????????????????????????? */}
            {this.state.loadWeiXin && (
              <SharePopup
                visible={this.state.isShowWeiXinShare}
                onClose={() => this.setState({ isShowWeiXinShare: false })}
                type="thread"
              />
            )}
          </Fragment>
        )}
      </div>
    );
  }
}

export default HOCTencentCaptcha(ThreadH5Page);
