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

@inject('site')
@inject('user')
@inject('index')
@observer
class H5OthersPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fetchUserInfoLoading: true,
    };
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
      Router.replace({ url: '/subPages/my/index' });
      return;
    }

    if (this.targetUserId) {
      // 如果是预览图片操作 就不需要重新更新状态
      if (this.isPreivewImage) {
        this.isPreivewImage = false;
        return;
      }

      this.setState({
        fetchUserInfoLoading: true,
      });

      // FIXME: 缓存所有加载的用户，利用缓存特性进行加载，避免此类问题
      // TODO: 需要重新进行存储的设计
      // 清空操作在 onshow 时再进行，避免数据更新导致的视图错误
      this.props.user.removeTargetUserInfo();

      await this.props.user.getTargetUserInfo(this.targetUserId);

      this.setState({
        fetchUserInfoLoading: false,
      });

      const targetUserThreadsList = await this.props.index.fetchList({
        namespace: `user/${this.targetUserId}`,
        filter: {
          toUserId: this.targetUserId,
          complex: 5,
        },
      });

      this.props.index.setList({ namespace: `user/${this.targetUserId}`, data: targetUserThreadsList });
    }
  };

  componentDidMount = async () => {
    this.setNavigationBarStyle();
    const { id = '' } = getCurrentInstance().router.params;
    const myId = this.props.user?.id;
    if (String(myId) === id) {
      Router.replace({ url: '/subPages/my/index' });
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
      const targetUserThreadsList = await this.props.index.fetchList({
        namespace: `user/${id}`,
        filter: {
          toUserId: id,
          complex: 5,
        },
      });
      this.props.index.setList({ namespace: `user/${id}`, data: targetUserThreadsList });
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
    const { user } = this.props;
    return (
      <View className={styles.topBar}>
        <View onClick={this.handleBack} className={styles.customCapsule} style={this.getTopBarBtnStyle()}>
          <Icon size={18} name="LeftOutlined" />
        </View>
        <View style={this.getTopBarTitleStyle()} className={styles.fullScreenTitle}>
          {user.targetUser?.nickname}的主页
        </View>
      </View>
    );
  };

  getBackgroundUrl = () => {
    let backgroundUrl = null;
    if (this.props.user?.targetOriginalBackGroundUrl) {
      backgroundUrl = this.props.user.targetOriginalBackGroundUrl;
    }
    if (!backgroundUrl) return false;
    return backgroundUrl;
  };

  showPreviewerRef = () => {
    if (this.previewerRef.current) {
      this.previewerRef.current.show();
    }
  };

  handlePreviewBgImage = (e) => {
    e && e.stopPropagation();
    if (!this.getBackgroundUrl()) return;
    this.isPreivewImage = true;
    this.showPreviewerRef();
  };

  render() {
    const { site, user } = this.props;
    const { platform } = site;
    const { targetUserId } = this;
    const { index } = this.props;
    const { lists } = index;

    const userThreadsList = index.getList({
      namespace: `user/${targetUserId}`,
    });

    const totalPage = index.getAttribute({
      namespace: `user/${targetUserId}`,
      key: 'totalPage',
    });

    const totalCount = index.getAttribute({
      namespace: `user/${targetUserId}`,
      key: 'totalCount',
    });

    const currentPage = index.getAttribute({
      namespace: `user/${targetUserId}`,
      key: 'currentPage',
    });

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
          {this.state.fetchUserInfoLoading && <BottomView className={styles.loadingBox} isBox loadingText="加载中..." />}
          <View
            style={{
              visibility: !this.state.fetchUserInfoLoading ? 'visible' : 'hidden',
              height: !this.state.fetchUserInfoLoading ? 'auto' : '0px',
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
              {userThreadsList.length > 0 && (
                  <UserCenterThreads showBottomStyle={false} data={userThreadsList} />
                )}
            </View>
          </View>
        </View>
        {this.getBackgroundUrl() && (
          <ImagePreviewer
            ref={this.previewerRef}
            imgUrls={[this.getBackgroundUrl()]}
            currentUrl={this.getBackgroundUrl()}
          />
        )}
      </BaseLayout>
    );
  }
}

export default H5OthersPage;
