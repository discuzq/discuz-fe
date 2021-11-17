import React from 'react';
import Taro, { getCurrentInstance } from '@tarojs/taro';
import Router from '@discuzq/sdk/dist/router';
import Page from '@components/page';
import { inject } from 'mobx-react';
import { updateViewCountInStorage } from '@common/utils/viewcount-in-storage';
import Toast from '@components/toast';
import ThreadData from '@layout/my/thread-data';
import { updateThreadAssignInfoInLists } from '@common/store/thread-list/list-business';

// const MemoToastProvider = React.memo(ToastProvider);
@inject('thread')
@inject('user')
@inject('threadList')
@inject('baselayout')
class ThreadDataPage extends React.Component {
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

  async componentDidShow() {

    const { id, postId } = getCurrentInstance().router.params;

    // 判断缓存
    // const oldId = this.props?.thread?.threadData?.threadId;
    // if (Number(id) === oldId && id && oldId) {
    //   return;
    // }
    // this.props.thread.reset();

    if (id) {
      await this.getPageData(id, postId);
      this.updateViewCount(id);
    }
  }

  // 尝试从列表中获取帖子数据
  async getThreadDataFromList(id) {
    if (id) {
      let threadData;

      let listType = '';
      const targetThreadList = this.props.threadList.findAssignThreadInLists({ threadId: Number(id) });
      if (targetThreadList?.length) {
        targetThreadList.forEach((targetThread) => {
          if (!threadData && targetThread.data) {
            listType = targetThread.listName;
            threadData = targetThread.data;
          }
        });
      }

      if (threadData?.threadId && !threadData?.displayTag?.isRedPack && !threadData?.displayTag?.isReward) {
        this.props.thread.setThreadData(threadData);
        this.props.thread.setPageDataListType(listType); // 记录使用的是哪个列表数据
      }
    }
  }

  async getPageData(id, postId) {
    // 如果存在缓存且和路由id不同,先清除缓存
    this.canUseCache();
    // 先尝试从列表store中获取帖子数据
    this.getThreadDataFromList(id);

    if (!this.props?.thread?.threadData) {
      const res = await this.props.thread.fetchThreadDetail(id);

      if (res.code !== 0) {
        // 404
        if (res.code === -4004) {
          Router.replace({ url: '/subPages/404/index' });
          return;
        }

        if (res.code > -5000 && res.code < -4000) {
          this.setState({
            serverErrorMsg: res.msg,
          });
        }

        if (res.code === -3001) {
          this.setState({
            serverErrorType: 'permission',
          });
        }

        if (res.code === -3006) {
          this.setState({
            serverErrorType: 'pay',
          });
        }

        this.setState({
          isServerError: true,
        });
        return;
      }
    }

    // 判断是否审核通过
    const isApproved = (this.props.thread?.threadData?.isApproved || 0) === 1;
    if (!isApproved) {
      const currentUserId = this.props.user?.userInfo?.id; // 当前登录用户
      const userId = this.props.thread?.threadData?.user?.userId; // 帖子作者
      // 不是作者自己。跳回首页
      if (!currentUserId || !userId || currentUserId !== userId) {
        Toast.info({ content: '内容正在审核中，审核通过后才能正常显示!' });
        Taro.redirectTo({
          url: `/indexPages/home/index`,
        });
        return;
      }
    }
  }

  // 判断缓存是否可用
  canUseCache() {
    const oldId = this.props?.thread?.threadData?.threadId;
    if (!oldId) return;

    const { id } = getCurrentInstance().router.params;
    if (id && oldId && Number(id) === oldId) return;

    this.props.thread.reset();
  }

  render() {
    return (
      <Page>
        <ThreadData />
      </Page>
    );
  }
}

// eslint-disable-next-line new-cap
export default ThreadDataPage;
