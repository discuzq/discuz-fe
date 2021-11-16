import React from 'react';
import { inject, observer } from 'mobx-react';
import IndexH5Page from '@layout/my/thread-data/h5';
import IndexPCPage from '@layout/my/thread-data/pc';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import Router from '@discuzq/sdk/dist/router';
import ViewAdapter from '@components/view-adapter';
import { Toast } from '@discuzq/design';
import isWeiXin from '@common/utils/is-weixin';
import { updateViewCountInStorage } from '@common/utils/viewcount-in-storage';
import { updateThreadAssignInfoInLists } from '@common/store/thread-list/list-business';

@inject('thread')
@inject('commentPosition')
@inject('user')
@inject('threadList')
@observer
class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isServerError: false,
      serverErrorType: 'error',
      serverErrorMsg: '',
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.router?.query?.id && this.props.router.query.id !== prevProps.router.query.id) {
      this.props.thread.reset();
      this.getPageData(this.props.router.query.id);
    }
  }

  async componentDidMount() {
    const { id, postId } = this.props.router.query;


    if (id) {
      await this.getPageDate(id, postId);
      this.updateViewCount(id);
    }
  }

  componentDidHide() {
    const { baselayout } = this.props;

    const playingAudioDom = baselayout?.playingAudioDom;

    if (playingAudioDom) {
      baselayout.playingAudioDom.pause();
      baselayout.playingAudioDom = null;
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
      updateThreadAssignInfoInLists(threadId, {
        updateType: 'viewCount',
        updatedInfo: { viewCount },
      });
    }
  };

  async getPageDate(id, postId) {
    // 获取帖子数据
    if (!this.props?.thread?.threadData || this.props?.thread?.threadData.needupdate || !this.hasMaybeCache()) {
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
        
        // 没有权限 返回首页
        if (res.code === -4002) {
          setTimeout(() => {
            Router.redirect({ url: '/' });
          }, 1000);
        }
        return;
      }
      this.props.thread.threadData.needupdate = false;

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
  }

  // 尝试从列表中获取帖子数据
  async getThreadDataFromList(id) {
    if (id) {
      let threadData;

      const targetThreadList = this.props.threadList.findAssignThreadInLists({ threadId: Number(id) });
      if (targetThreadList?.length) {
        targetThreadList.forEach((targetThread) => {
          if (!threadData && targetThread.data) {
            targetThread = targetThread.data;
          }
        });
      }

      if (threadData?.threadId) {
        this.props.thread.setThreadData(threadData);
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
    return <ViewAdapter h5={<IndexH5Page />} pc={<IndexPCPage />} />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(Index);
