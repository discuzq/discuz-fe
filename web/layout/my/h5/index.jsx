import React from 'react';
import styles from './index.module.scss';
import { Divider, Spin, Toast, ImagePreviewer } from '@discuzq/design';
import UserCenterHeaderImage from '@components/user-center-header-images';
import UserCenterHead from '@components/user-center-head';
import { inject, observer } from 'mobx-react';
import UserCenterPost from '@components/user-center-post';
import UserCenterAction from '@components/user-center-action';
import UserCenterThreads from '@components/user-center-threads';
import BaseLayout from '@components/base-layout';
import { withRouter } from 'next/router';

@inject('site')
@inject('user')
@inject('index')
@observer
class H5MyPage extends React.Component {
  constructor(props) {
    super(props);
    this.isUnmount = false;
    this.state = {
      isLoading: true,
      isPreviewBgVisible: false, // 是否预览背景图片
    };
  }

  fetchUserThreads = async () => {
    try {
      const userThreadsList = await this.props.index.fetchList({
        namespace: 'my',
        filter: {
          toUserId: 0,
          complex: 5,
        },
      });
      if (!this.unMount) {
        this.props.index.setList({ namespace: 'my', data: userThreadsList });
      }
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

  onRefresh = async () => {
    const { isLoading } = this.state;

    // 避免第一次进入页面时，触发了上拉加载
    if (!isLoading) {
      return await this.fetchUserThreads();
    }
    return Promise.resolve();
  };

  beforeRouterChange = (url) => {
    if (url === '/my') {
      return;
    }
    // 如果不是进入 thread 详情页面
    if (!/thread\//.test(url)) {
      this.props.index.clearList({ namespace: 'my' });
    }
  };

  componentDidMount = async () => {
    this.props.router.events.on('routeChangeStart', this.beforeRouterChange);

    if (this.props.user.id) {
      await this.props.user.updateUserInfo(this.props.user.id);

      try {
        // 如果当前数据被清理，重新请求最新的数据
        if (!this.props.user.userThreads[1]) {
          this.props.user.userThreadsPage = 1;
          this.props.user.userThreadsTotalCount = 0;
          this.props.user.userThreadsTotalPage = 1;
          await this.fetchUserThreads();
        }
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

  componentWillUnmount = () => {
    this.unMount = true;
    this.props.router.events.off('routeChangeStart', this.beforeRouterChange);
  };

  formatUserThreadsData = (userThreads) => {
    if (Object.keys(userThreads).length === 0) return [];
    return Object.values(userThreads).reduce((fullData, pageData) => [...fullData, ...pageData]);
  };

  handlePreviewBgImage = (e) => {
    e && e.stopPropagation();
    this.setState({
      isPreviewBgVisible: !this.state.isPreviewBgVisible,
    });
  };

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
    const { site } = this.props;
    const { platform } = site;
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
        curr={'my'}
        pageName="my"
        showHeader={false}
        showTabBar={true}
        onRefresh={this.onRefresh}
        noMore={!isLoading && currentPage >= totalPage}
        requestError={requestError.isError}
        errorText={requestError.errorText}
        immediateCheck
      >
        <div className={styles.mobileLayout}>
          <div onClick={this.handlePreviewBgImage}>
            <UserCenterHeaderImage />
          </div>
          <UserCenterHead platform={platform} />
          <div className={styles.unit}>
            <UserCenterAction />
          </div>
          <div className={styles.unit}>
            <UserCenterPost />
          </div>
          <div className={styles.unit}>
            <div className={styles.threadUnit}>
              <div className={styles.threadTitle}>主题</div>
              <div className={styles.threadCount}>{totalCount !== undefined ? `${totalCount}个主题` : ''}</div>
            </div>

            <div className={styles.dividerContainer}>
              <Divider className={styles.divider} />
            </div>

            <div className={styles.threadItemContainer}>
              {myThreadsList?.length > 0 && <UserCenterThreads data={myThreadsList} />}
            </div>
          </div>
        </div>
        {this.getBackgroundUrl() && this.state.isPreviewBgVisible && (
          <ImagePreviewer
            visible={this.state.isPreviewBgVisible}
            onClose={this.handlePreviewBgImage}
            imgUrls={[this.getBackgroundUrl()]}
            currentUrl={this.getBackgroundUrl()}
          />
        )}
      </BaseLayout>
    );
  }
}

export default withRouter(H5MyPage);
