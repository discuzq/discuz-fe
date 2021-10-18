import React from 'react';
import styles from './index.module.scss';
import Spin from '@discuzq/design/dist/components/spin/index';
import Icon from '@discuzq/design/dist/components/icon/index';
import UserCenterHeaderImage from '@components/user-center-header-images';
import UserCenterHead from '@components/user-center-head';
import { inject, observer } from 'mobx-react';
import UserCenterThreads from '@components/user-center-threads';
import BaseLayout from '@components/base-layout';
import Router from '@discuzq/sdk/dist/router';
import { View, Text } from '@tarojs/components';
import Taro, { getCurrentInstance, eventCenter } from '@tarojs/taro';
import SectionTitle from '@components/section-title';
import BottomView from '@components/list/BottomView';
import ImagePreviewer from '@discuzq/design/dist/components/image-previewer/index';
import checkImgExists from '@common/utils/check-image-exists';

@inject('site')
@inject('user')
@inject('threadList')
@observer
class H5OthersPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fetchUserInfoLoading: true,
      previewBackgroundUrl: null // 预览背景图片链接
    };

    this.previewBackgroundLoading = false; // 预览背景图片是否在预加载

    const { id = '' } = getCurrentInstance().router.params;

    if (this.props.user.targetUsers[id]) {
      this.state.fetchUserInfoLoading = false;
    }
    // 因为这里的 onShow 的 flag 是路由，导致如果进入多个用户信息页面，重复触发了
    // 一个页面只负责一个用户 id，用此 flag 来解决重复加载的问题
    this.targetUserId = null;
    this.isPreivewImage = null;
  }

  $instance = getCurrentInstance();

  previewerRef = React.createRef(null);

  componentWillMount() {
    const onShowEventId = this.$instance.router.onShow;
    // 监听
    eventCenter.on(onShowEventId, this.onShow);
  }

  setNavigationBarStyle = () => {
    Taro.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#ffffff',
    });
  };

  updatePreviewImageStatus = (bol) => {
    this.isPreivewImage = bol;
  };

  onShow = async () => {
    const { id = '' } = getCurrentInstance().router.params;
    if (!id) {
      Router.replace({ url: '/indexPages/home/index' });
    }
    if (!this.targetUserId) {
      this.targetUserId = id;
    }
    // 仅当前激活 id 的事件会触发
    if (this.targetUserId !== id) return;
    const myId = this.props.user?.id;
    if (String(myId) === this.targetUserId) {
      Router.replace({ url: '/userPages/my/index' });
      return;
    }

    if (this.targetUserId) {
      // 如果是预览图片操作 就不需要重新更新状态
      if (this.isPreivewImage) {
        this.isPreivewImage = false;
        return;
      }

      if (!this.props.user.targetUsers[this.targetUserId]) {
        this.setState({
          fetchUserInfoLoading: true,
        });
      }

      await this.props.user.getTargetUserInfo({ userId: this.targetUserId });

      this.setState({
        fetchUserInfoLoading: false,
      });

      const targetUserThreadsList = await this.props.threadList.fetchList({
        namespace: `user/${this.targetUserId}`,
        filter: {
          toUserId: this.targetUserId,
          complex: 5,
        },
      });

      this.props.threadList.setList({ namespace: `user/${this.targetUserId}`, data: targetUserThreadsList });
    }
  };

  componentDidMount = async () => {
    this.setNavigationBarStyle();
    const { id = '' } = getCurrentInstance().router.params;
    const myId = this.props.user?.id;
    if (String(myId) === id) {
      Router.replace({ url: '/userPages/my/index' });
      return;
    }
  };

  componentWillUnmount() {
    const onShowEventId = this.$instance.router.onShow;
    // 卸载
    eventCenter.off(onShowEventId, this.onShow);
  }

  fetchTargetUserThreads = async () => {
    const { id = '' } = getCurrentInstance().router.params;
    if (id) {
      const targetUserThreadsList = await this.props.threadList.fetchList({
        namespace: `user/${id}`,
        filter: {
          toUserId: id,
          complex: 5,
        },
      });
      this.props.threadList.setList({ namespace: `user/${id}`, data: targetUserThreadsList });
    }
    return;
  };

  formatUserThreadsData = (targetUserThreads) => {
    if (Object.keys(targetUserThreads).length === 0) return [];
    return Object.values(targetUserThreads).reduce((fullData, pageData) => [...fullData, ...pageData]);
  };

  getStatusBarHeight() {
    return wx?.getSystemInfoSync()?.statusBarHeight || 44;
  }

  // 全屏状态下自定义左上角返回按钮位置
  getTopBarBtnStyle() {
    return {
      position: 'fixed',
      top: `${this.getStatusBarHeight()}px`,
      left: '12px',
      transform: 'translate(0, 10px)',
    };
  }

  getTopBarTitleStyle() {
    return {
      position: 'fixed',
      top: `${this.getStatusBarHeight()}px`,
      left: '50%',
      transform: 'translate(-50%, 8px)',
    };
  }

  handleBack = () => {
    Taro.navigateBack();
  };

  // 渲染顶部title
  renderTitleContent = () => {
    const { id = '' } = getCurrentInstance().router.params;
    const { user } = this.props;

    if (user.targetUsers[id]) {
      return (
        <View className={styles.topBar}>
          <View onClick={this.handleBack} className={styles.customCapsule} style={this.getTopBarBtnStyle()}>
            <Icon size={18} name="LeftOutlined" />
          </View>
          <View style={this.getTopBarTitleStyle()} className={styles.fullScreenTitle}>
            {user.targetUsers[id]?.nickname}的主页
          </View>
        </View>
      );
    }

    return (
      <View className={styles.topBar}>
        <View onClick={this.handleBack} className={styles.customCapsule} style={this.getTopBarBtnStyle()}>
          <Icon size={18} name="LeftOutlined" />
        </View>
      </View>
    );
  };

  getBackgroundUrl = async () => {
    if (this.state.previewBackgroundUrl) return;
    let backgroundUrl = '';
    const { id = '' } = getCurrentInstance().router.params;
    if (id && this.props.user?.targetUsers[id]) {
      const targetUsers = this.props.user.targetUsers[id];
      backgroundUrl = await checkImgExists(targetUsers.originalBackGroundUrl, targetUsers.backgroundUrl);
    }
    backgroundUrl && this.setState({
      previewBackgroundUrl: backgroundUrl
    })
  };

  previewBackgroundPreLoad = async () => {
    const { previewBackgroundUrl } = this.state;
    const { id = '' } = getCurrentInstance().router.params;
    const { user } = this.props;

    if( !id || !user.targetUsers[id] || previewBackgroundUrl || this.previewBackgroundLoading){
      return;
    }
    this.previewBackgroundLoading = true;
    const imgUrl = await checkImgExists(user.targetUsers[id].originalBackGroundUrl, user.targetUsers[id].backgroundUrl);
    this.previewBackgroundLoading = false;
    this.setState({
      previewBackgroundUrl: imgUrl
    })

  }

  showPreviewerRef = () => {
    if (this.previewerRef.current) {
      this.previewerRef.current.show();
    }
  };

  handlePreviewBgImage = (e) => {
    e && e.stopPropagation();
    if (!this.state.previewBackgroundUrl) return;
    this.isPreivewImage = true;
    this.showPreviewerRef();
  };

  render() {
    const { site, user } = this.props;
    const { platform } = site;
    const { targetUserId } = this;
    const { threadList } = this.props;
    const { lists } = threadList;
    const { previewBackgroundUrl } = this.state

    this.previewBackgroundPreLoad(); // 背景图预加载
    const userThreadsList = threadList.getList({
      namespace: `user/${targetUserId}`,
    });

    const totalPage = threadList.getAttribute({
      namespace: `user/${targetUserId}`,
      key: 'totalPage',
    });

    const totalCount = threadList.getAttribute({
      namespace: `user/${targetUserId}`,
      key: 'totalCount',
    });

    const currentPage = threadList.getAttribute({
      namespace: `user/${targetUserId}`,
      key: 'currentPage',
    });

    !previewBackgroundUrl && this.getBackgroundUrl();

    return (
      <BaseLayout
        showHeader={false}
        showTabBar={false}
        immediateCheck
        onRefresh={this.fetchTargetUserThreads}
        noMore={totalPage < currentPage}
        showLoadingInCenter={!userThreadsList.length}
      >
        <View className={styles.mobileLayout}>
          {this.renderTitleContent()}
          {this.state.fetchUserInfoLoading && (
            <BottomView className={styles.loadingBox} isBox loadingText="加载中..." />
          )}
          <View
            style={{
              display: !this.state.fetchUserInfoLoading ? 'block' : 'none'
            }}
          >
            <View onClick={this.handlePreviewBgImage}>
              <UserCenterHeaderImage isOtherPerson />
            </View>
            <UserCenterHead
              updatePreviewImageStatus={this.updatePreviewImageStatus}
              platform={platform}
              isOtherPerson
            />
          </View>

          <View className={styles.unit}>
            {/* <View className={styles.threadUnit}>
              <View className={styles.threadTitle}>主题</View>
              <View className={styles.threadCount}>{targetUserThreadsTotalCount}个主题</View>
            </View> */}

            {/* <View className={styles.ViewiderContainer}>
              <Viewider className={styles.Viewider} />
            </View> */}

            <View className={styles.threadHeader}>
              <SectionTitle title="主题" isShowMore={false} leftNum={`${totalCount || 0}个主题`} />
            </View>

            <View className={styles.threadItemContainer}>
              {userThreadsList.length > 0 && <UserCenterThreads showBottomStyle={false} data={userThreadsList} />}
            </View>
          </View>
        </View>
        {previewBackgroundUrl && (
          <ImagePreviewer
            ref={this.previewerRef}
            imgUrls={[previewBackgroundUrl]}
            currentUrl={previewBackgroundUrl}
          />
        )}
      </BaseLayout>
    );
  }
}

export default H5OthersPage;
