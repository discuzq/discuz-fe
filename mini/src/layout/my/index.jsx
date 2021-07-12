import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';
import { View, Text } from '@tarojs/components';
import UserCenterHeaderImage from '@components/user-center-header-images';
import UserCenterHead from '@components/user-center-head';
import UserCenterAction from '@components/user-center-action';
import Thread from '@components/thread';
import BaseLayout from '@components/base-layout';
import UserCenterPost from '../../components/user-center-post';
import SectionTitle from '@components/section-title';
import Taro, { getCurrentInstance, eventCenter } from '@tarojs/taro';
import ImagePreviewer from '@discuzq/design/dist/components/image-previewer/index';
@inject('user')
@observer
export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      isPreviewBgVisible: false, // 是否预览背景图片
    };
  }

  $instance = getCurrentInstance();

  previewerRef = React.createRef(null);

  componentWillMount() {
    const onShowEventId = this.$instance.router.onShow;
    // 监听
    eventCenter.on(onShowEventId, this.onShow);
  }

  fetchUserThreads = async () => {
    try {
      const userThreadsList = await this.props.user.getUserThreads();
      this.props.user.setUserThreads(userThreadsList);
    } catch (err) {
      console.error(err);
      let errMessage = '加载用户列表失败';
      if (err.Code && err.Code !== 0) {
        errMessage = err.Msg;
      }

      Toast.error({
        content: errMessage,
        duration: 2000,
        hasMask: false,
      });
    }
  };

  onShow = async () => {
    if (this.props.user.id) {
      await this.props.user.updateUserInfo(this.props.user.id);

      try {
        this.props.user.userThreadsPage = 1;
        this.props.user.userThreadsTotalCount = 0;
        this.props.user.userThreadsTotalPage = 1;

        await this.fetchUserThreads();
      } catch (e) {
        console.error(e);
        if (e.Code) {
          Toast.error({
            content: e.Msg || '获取用户主题列表失败',
            duration: 2000,
          });
        }
      }
      this.setState({ isLoading: false });
    }
  };

  // 处理页面栈退出后，数据没有重置
  componentWillUnmount() {
    this.props.user.clearUserThreadsInfo();
    const onShowEventId = this.$instance.router.onShow;
    // 卸载
    eventCenter.off(onShowEventId, this.onShow);
  }

  formatUserThreadsData = (userThreads) => {
    if (Object.keys(userThreads).length === 0) return [];
    return Object.values(userThreads).reduce((fullData, pageData) => [...fullData, ...pageData]);
  };

  onRefresh = () => {
    const { isLoading } = this.state;

    // 避免第一次进入页面时，触发了上拉加载
    if (!isLoading) {
      return this.fetchUserThreads;
    }
    return Promise.resolve();
  };

  getStatusBarHeight() {
    return wx?.getSystemInfoSync()?.statusBarHeight || 44;
  }

  getTopBarTitleStyle() {
    return {
      position: 'fixed',
      top: `${this.getStatusBarHeight()}px`,
      left: '50%',
      transform: 'translate(-50%, 8px)',
    };
  }

  // 渲染顶部title
  renderTitleContent = () => {
    return (
      <View className={styles.topBar}>
        <View style={this.getTopBarTitleStyle()} className={styles.fullScreenTitle}>
          我的主页
        </View>
      </View>
    );
  };

  /**
   * 控制预览图片窗口显示隐藏
   * @param {Boolean} visible true显示 false不显示
   * @param {Function} calback 处理的回调
   */
  togglePreviewBgVisible = ({ visible, calback }) => {
    this.setState(
      {
        isPreviewBgVisible: visible,
      },
      () => {
        if (calback && typeof calback === 'function') calback();
      },
    );
  };

  showPreviewerRef = () => {
    if (this.previewerRef.current) {
      this.previewerRef.current.show();
    }
  };

  //点击预览
  handlePreviewBgImage = (e) => {
    e && e.stopPropagation();
    if (!this.getBackgroundUrl()) return;
    this.togglePreviewBgVisible({
      visible: true,
      calback: this.showPreviewerRef(),
    });
  };

  // 预览窗口关闭回调
  onCloseImagePreview = () => {
    this.togglePreviewBgVisible({
      visible: false,
    });
  };

  // 获取背景图片
  getBackgroundUrl = () => {
    let backgroundUrl = null;
    if (this.props.isOtherPerson) {
      if (this.props.user?.targetUserBackgroundUrl) {
        backgroundUrl = this.props.user.targetUserBackgroundUrl;
      }
    } else {
      backgroundUrl = this.props.user?.backgroundUrl;
    }
    if (!backgroundUrl) return false;
    return backgroundUrl;
  };

  render() {
    const { isLoading } = this.state;
    const { user } = this.props;
    const { userThreads, userThreadsTotalCount, userThreadsPage, userThreadsTotalPage } = user;
    const formattedUserThreads = this.formatUserThreadsData(userThreads);
    return (
      <BaseLayout
        showHeader={false}
        showTabBar
        noMore={!isLoading && userThreadsPage >= userThreadsTotalPage}
        onRefresh={this.onRefresh}
        curr="my"
      >
        <View className={styles.mobileLayout}>
          {this.renderTitleContent()}
          <View onClick={this.handlePreviewBgImage}>
            <UserCenterHeaderImage />
          </View>
          <UserCenterHead />
          <View className={styles.unit}>
            <UserCenterAction />
          </View>

          <View className={styles.unit}>
            <UserCenterPost />
          </View>

          <View className={`${styles.unit} ${styles.threadBackgroundColor}`}>
            <View className={styles.threadHeader}>
              <SectionTitle
                title="主题"
                isShowMore={false}
                leftNum={`${userThreadsTotalCount || formattedUserThreads.length}个主题`}
              />
            </View>

            {!isLoading &&
              formattedUserThreads?.map((item, index) => (
                <Thread data={item} key={`${item.threadId}-${item.updatedAt}`} />
              ))}
          </View>
        </View>
        {this.getBackgroundUrl() && this.state.isPreviewBgVisible && (
          <ImagePreviewer
            ref={this.previewerRef}
            visible={this.state.isPreviewBgVisible}
            onClose={this.onCloseImagePreview}
            imgUrls={[this.getBackgroundUrl()]}
            currentUrl={this.getBackgroundUrl()}
          />
        )}
      </BaseLayout>
    );
  }
}
