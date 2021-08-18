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
import classnames from 'classnames';

@inject('user')
@inject('index')
@observer
export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      isPreviewBgVisible: false, // 是否预览背景图片
      isNormalTitle: false, // 是否显示不透明 title
    };
  }

  $instance = getCurrentInstance();

  previewerRef = React.createRef(null);

  componentWillMount() {
    const onShowEventId = this.$instance.router.onShow;
    // 监听
    eventCenter.on(onShowEventId, this.onShow);
  }

  componentDidMount() {
    this.setNavigationBarStyle();
  }

  setNavigationBarStyle = () => {
    Taro.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#ffffff',
    });
  };

  fetchUserThreads = async () => {
    try {
      const userThreadsList = await this.props.index.fetchList({
        namespace: 'my',
        filter: {
          toUserId: 0,
          complex: 5,
        },
      });
      this.props.index.setList({ namespace: 'my', data: userThreadsList });
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
    this.props.index.clearList({ namespace: 'my' });
    const onShowEventId = this.$instance.router.onShow;
    // 卸载
    eventCenter.off(onShowEventId, this.onShow);
  }

  onRefresh = async () => {
    const { isLoading } = this.state;

    // 避免第一次进入页面时，触发了上拉加载
    if (!isLoading) {
      return await this.fetchUserThreads();
    }
    return Promise.resolve();
  };

  getStatusBarHeight() {
    return wx?.getSystemInfoSync()?.statusBarHeight || 44;
  }

  getTopBarTitleStyle() {
    if (this.state.isNormalTitle) {
      return {
        position: 'fixed',
        top: 0,
        height: `${this.getStatusBarHeight() + 50}px`,
        left: '50%',
        transform: 'translate(-50%)',
        color: 'black',
        zIndex: 1000,
        width: '100%',
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: `${this.getStatusBarHeight() - 8}px`,
      };
    }

    return {
      position: 'fixed',
      top: `${this.getStatusBarHeight()}px`,
      left: '50%',
      transform: 'translate(-50%, 8px)',
      zIndex: 1000
    };
  }

  // 渲染顶部title
  renderTitleContent = () => {
    return (
      <View className={classnames(styles.topBar)}>
        <View style={this.getTopBarTitleStyle()} className={styles.fullScreenTitle}>
          我的主页
        </View>
      </View>
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
    this.showPreviewerRef();
  };

  // 获取背景图片
  getBackgroundUrl = () => {
    let backgroundUrl = null;
    if (this.props.isOtherPerson) {
      if (this.props.user?.targetOriginalBackGroundUrl) {
        backgroundUrl = this.props.user.targetOriginalBackGroundUrl;
      }
    } else {
      backgroundUrl = this.props.user?.originalBackGroundUrl;
    }
    if (!backgroundUrl) return false;
    return backgroundUrl;
  };

  render() {
    const { isLoading } = this.state;
    const { user } = this.props;

    const { index } = this.props;
    const { lists } = index;

    const myThreadsList = index.getList({
      namespace: 'my',
    });

    const totalPage = index.getAttribute({
      namespace: 'my',
      key: 'totalPage',
    });

    const totalCount = index.getAttribute({
      namespace: 'my',
      key: 'totalCount',
    });

    const currentPage = index.getAttribute({
      namespace: 'my',
      key: 'currentPage',
    });

    const requestError = index.getListRequestError({ namespace: 'my' });

    return (
      <BaseLayout
        onScroll={(e) => {
          const currentScrollTop = e.detail.scrollTop;
          if (currentScrollTop > 170) {
            this.setState({
              isNormalTitle: true,
            });
          } else {
            this.setState({
              isNormalTitle: false,
            });
          }
        }}
        showHeader={false}
        showTabBar
        noMore={!isLoading && currentPage >= totalPage}
        onRefresh={this.onRefresh}
        requestError={requestError.isError}
        errorText={requestError.errorText}
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
                leftNum={`${totalCount || myThreadsList.length}个主题`}
              />
            </View>

            {!isLoading &&
              myThreadsList?.map((item, index) => (
                <Thread data={item} key={`${item.threadId}-${item.updatedAt}-${item.user.avatar}`} />
              ))}
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
