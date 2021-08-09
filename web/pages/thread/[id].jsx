import React from 'react';
import { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import { readThreadDetail, readCommentList } from '@server';
import ThreadH5Page from '@layout/thread/h5';
import ThreadPCPage from '@layout/thread/pc';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import Router from '@discuzq/sdk/dist/router';
import ErrorPCPage from '@layout/error/pc';
import ErrorH5Page from '@layout/error/h5';
import ViewAdapter from '@components/view-adapter';
import { Toast } from '@discuzq/design';
import setWxShare from '@common/utils/set-wx-share';
import htmlToString from '@common/utils/html-to-string';
import isWeiXin from '@common/utils/is-weixin';
import { updateViewCountInStorage } from '@common/utils/viewcount-in-storage';

@inject('site')
@inject('thread')
@inject('commentPosition')
@inject('user')
@inject('index')
@inject('topic')
@inject('search')
@observer
class Detail extends React.Component {
  static async getInitialProps(ctx) {
    const id = ctx?.query?.id;
    const serverThread = {
      threadData: null,
      commentList: null,
      totalCount: 0,
      authorInfo: null,
    };

    if (id) {
      // 获取帖子详情
      const res = await readThreadDetail({ params: { threadId: Number(id) } });
      if (res.code === 0) {
        serverThread.threadData = res.data;
      }

      // 获取评论列表
      const commentRes = await readCommentList({
        params: {
          filter: {
            thread: Number(id),
          },
          sort: 'createdAt',
          page: 1,
          perPage: 20,
        },
      });

      if (commentRes.code === 0) {
        serverThread.commentList = commentRes.data?.pageData || [];
        serverThread.totalCount = commentRes.data?.totalCount || 0;
      }
    }

    return {
      serverThread,
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      isServerError: false,
      serverErrorMsg: '',
    };

    const { thread, serverThread } = this.props;

    // 初始化数据到store中
    // serverThread?.threadData && thread.setThreadData(serverThread.threadData);
    serverThread?.commentList && thread.setCommentList(serverThread.commentList);
    serverThread?.totalCount && thread.setTotalCount(serverThread.totalCount);
  }

  componentDidUpdate(prevProps) {
    if (this.props.router?.query?.id && this.props.router.query.id !== prevProps.router.query.id) {
      this.props.thread.reset();
      this.getPageDate(this.props.router.query.id);
    }

    if (this.props.router?.query?.postId && this.props.router.query.postId !== prevProps.router.query.postId) {
      this.getPositionComment(this.props.router?.query?.id, this.props.router.query.postId);
    }
  }

  async componentDidMount() {
    const { id, postId } = this.props.router.query;

    if (id) {
      await this.getPageDate(id, postId);
      this.updateViewCount(id);
    }
  }


  updateViewCount = async (id) => {
    const { site } = this.props;
    const { openViewCount } = site?.webConfig?.setSite || {};
    const viewCountMode = Number(openViewCount);

    const threadId = Number(id);
    const viewCount = await updateViewCountInStorage(threadId, viewCountMode === 0);
    if (viewCount) {
      this.props.thread.updateViewCount(viewCount);
      this.props.index.updateAssignThreadInfo(threadId, {
        updateType: 'viewCount',
        updatedInfo: { viewCount },
      });
      this.props.search.updateAssignThreadInfo(threadId, {
        updateType: 'viewCount',
        updatedInfo: { viewCount },
      });
      this.props.topic.updateAssignThreadInfo(threadId, {
        updateType: 'viewCount',
        updatedInfo: { viewCount },
      });
    }
  };

  handleWeiXinShare = async () => {
    try {
      const { site, thread } = this.props;
      const { webConfig } = site;
      const { setSite } = webConfig;
      const { siteHeaderLogo, siteIntroduction } = setSite;
      const { threadData } = thread;
      const { content, title, user: threadUser, payType, isAnonymous } = threadData;
      const { text, indexes } = content;
      function setSpecialTitle(text, user, indexes = []) {
        // 全贴付费不能使用内容展示
        if (text) {
          const contentStr = htmlToString(text);
          if (contentStr) {
            return contentStr.length > 28 ? `${contentStr.substr(0, 28)}...` : contentStr;
          }
        }

        const arr = [];
        if (indexes['101']) arr.push('图片');
        if (indexes['103']) arr.push('视频');
        if (indexes['102']) arr.push('语音');
        if (indexes['108']) arr.push('附件');
        const contentLable = arr.length > 0 ? `${arr.join('/')}` : '内容';
        const name = user && user.nickname ? `${user.nickname}` : '匿名用户';
        return `${name}发布的${contentLable}`;
      }

      function setShareImg(threadUser, text, indexes = [], favicon) {
        let img = null;

        // 全贴付费不能使用内容展示
        if (payType !== 1) {
          // 取图文混排图片
          const imageList = text.match(/<img[\s]+[^<>]*>|<img[\s]+[^<>]*/g) || [];
          for (let i = 0; i < imageList.length; i++) {
            if (imageList[i].indexOf('qq-emotion') === -1) {
              img = imageList[i].match(/(http|https):\/\/.*?(webp|png|jpg|jpeg)/gi);
              if (img) {
                img = img ? img[0] : null;
                break;
              }
            }
          }
          // 附件付费不能使用内容展示
          if (payType !== 2) {
            // 取上传图片
            if (!img && indexes['101']) {
              const bodyImgs = indexes['101'].body || [];
              for (let i = 0; i < bodyImgs.length; i++) {
                if (bodyImgs[i].extension !== 'gif') {
                  img = bodyImgs[i].thumbUrl;
                  break;
                }
              }
            }
          }
        }

        // 取用户头像
        if (!isAnonymous && !img && threadUser && threadUser.avatar) {
          img = threadUser.avatar;
        }

        if (!img && favicon && favicon !== '') {
          img = favicon;
        }

        return img;
      }

      const desc = siteIntroduction && siteIntroduction !== '' ? siteIntroduction : '在这里，发现更多精彩内容';
      const shareTitle = title && title !== '' ? title : setSpecialTitle(text, threadUser, indexes);
      const shareImg = setShareImg(threadUser, text, indexes, siteHeaderLogo);
      setWxShare(shareTitle, desc, window.location.href, shareImg);
    } catch (err) {
      console.error('设置分享错误', err);
    }
  };

  async getPageDate(id, postId) {
    // 获取帖子数据
    if (!this.props?.thread?.threadData || !this.hasMaybeCache()) {
      // TODO:这里可以做精细化重置
      const isPositionToComment = this.props.thread?.isPositionToComment || false;
      this.props.thread.reset({ isPositionToComment });

      const res = await this.props.thread.fetchThreadDetail(id);
      if (res.code !== 0) {
        // 404
        if (res.code === -4004) {
          Router.replace({ url: '/404' });
          return;
        }

        if (res.code > -5000 && res.code < -4000) {
          this.setState({
            serverErrorMsg: res.msg,
          });
        }

        this.setState({
          isServerError: true,
        });
        return;
      }

      // 判断是否审核通过
      const isApproved = (this.props.thread?.threadData?.isApproved || 0) === 1;
      if (!isApproved) {
        const currentUserId = this.props.user?.userInfo?.id; // 当前登录用户
        const userId = this.props.thread?.threadData?.user?.userId; // 帖子作者
        // 不是作者自己。跳回首页
        if (!currentUserId || !userId || currentUserId !== userId) {
          Toast.info({ content: '内容正在审核中，审核通过后才能正常显示!' });
          Router.redirect({ url: '/' });
          return;
        }
      }
    }

    if (this.hasMaybeCache()) {
      // 判断是否审核通过
      const isApproved = (this.props.thread?.threadData?.isApproved || 0) === 1;
      if (!isApproved) {
        // 先尝试从列表store中获取帖子数据
        this.getThreadDataFromList(id);
      }
    }

    // 设置详情分享
    isWeiXin() && this.handleWeiXinShare();

    await this.getPositionComment(id, postId);

    // 获取评论列表
    if (!this.props?.thread?.commentList || !this.hasMaybeCache()) {
      this.props.thread.setCommentListPage(this.props.commentPosition?.postsPositionPage || 1);
      const params = {
        id,
        page: this.props.thread.page,
      };
      this.props.thread.loadCommentList(params);
    }

    // 获取作者信息
    if (!this.props?.thread?.authorInfo || !this.hasMaybeCache()) {
      const { site } = this.props;
      const { platform } = site;
      const userId = this.props.thread?.threadData?.user?.userId;
      if (platform === 'pc' && userId) {
        this.props.thread.fetchAuthorInfo(userId);
      }
    }
  }

  // 尝试从列表中获取帖子数据
  async getThreadDataFromList(id) {
    if (id) {
      let threadData;
      // 首页iebook
      const indexRes = this.props.index.findAssignThread(Number(id));
      threadData = indexRes?.data;

      // 发现列表
      if (!threadData) {
        const searchRes = this.props.search.findAssignThread(Number(id));
        threadData = searchRes[0]?.data;
      }

      // 话题列表
      if (!threadData) {
        const topicRes = this.props.topic.findAssignThread(Number(id));
        threadData = topicRes?.data;
      }

      if (threadData?.threadId) {
        this.props.thread.setThreadData(threadData);
      }
    }
  }
  
  // 获取指定评论位置的相关信息
  async getPositionComment(id, postId) {
    // 获取评论所在的页面位置
    if (id && postId) {
      this.props.commentPosition.setPostId(Number(postId));
      const params = {
        threadId: id,
        postId,
        pageSize: 20,
      };
      await this.props.commentPosition.fetchPositionPosts(params);
      // 请求第一页的列表数据
      if (this.props.commentPosition.isShowCommentList) {
        const params = {
          id,
        };
        this.props.commentPosition.loadCommentList(params);
      }
    }
  }

  // 判断是否可能存在缓存
  hasMaybeCache() {
    const { id } = this.props.router.query;
    const oldId = this.props?.thread?.threadData?.threadId;

    return id && oldId && Number(id) === oldId;
  }

  render() {
    const { site, canPublish } = this.props;
    const { platform } = site;
    let showSiteName = true;
    if (this.props?.thread?.threadData?.title || this.props?.thread?.threadData?.content?.text) {
      showSiteName = false;
    }
    if (this.state.isServerError) {
      return platform === 'h5' ? (
        <ErrorH5Page text={this.state.serverErrorMsg} />
      ) : (
        <ErrorPCPage text={this.state.serverErrorMsg} />
      );
    }

    return (
      <ViewAdapter
        h5={<ThreadH5Page />}
        pc={<ThreadPCPage canPublish={canPublish}/>}
        title={this.props?.thread?.title || ''}
        showSiteName={showSiteName}
      />
    );
  }
}

// eslint-disable-next-line new-cap
export default withRouter(HOCFetchSiteData(Detail));
