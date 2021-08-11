import React from 'react';
import styles from './index.module.scss';
import { Divider, Spin, ImagePreviewer } from '@discuzq/design';
import UserCenterHeaderImage from '@components/user-center-header-images';
import UserCenterHead from '@components/user-center-head';
import { inject, observer } from 'mobx-react';
import UserCenterPost from '@components/user-center-post';
import UserCenterAction from '@components/user-center-action';
import UserCenterThreads from '@components/user-center-threads';
import BaseLayout from '@components/base-layout';
import NoData from '@components/no-data';
import { withRouter } from 'next/router';
import Router from '@discuzq/sdk/dist/router';
import setWxShare from '@common/utils/set-wx-share';

@inject('site')
@inject('user')
@inject('index')
@observer
class H5OthersPage extends React.Component {
  constructor(props) {
    super(props);
    this.props.user.cleanTargetUserThreads();
    this.state = {
      fetchUserInfoLoading: true,
      isPreviewBgVisible: false, // 是否预览背景图
    };
  }

  targetUserId = null;

  componentDidMount = async () => {
    const { query } = this.props.router;
    const id = this.props.user?.id;
    if (!query.id || query.id === 'undefined') {
      Router.replace({ url: '/' });
    }
    if (String(id) === query.id) {
      Router.replace({ url: '/my' });
      return;
    }
    if (query.id) {
      await this.props.user.getTargetUserInfo(query.id);
      this.setWeixinShare();
      this.targetUserId = query.id;
      this.setState({
        fetchUserInfoLoading: false,
      });
    }
  };

  // 用来处理浅路由跳转
  componentDidUpdate = async () => {
    const { query } = this.props.router;
    const id = this.props.user?.id;
    if (!query.id || query.id === 'undefined') {
      Router.replace({ url: '/' });
    }
    if (String(id) === query.id) {
      Router.replace({ url: '/my' });
      return;
    }

    // cdm 周期不触发
    if (!this.targetUserId) return;

    if (String(this.targetUserId) === String(query.id)) return;
    this.targetUserId = query.id;
    if (query.id) {
      this.setState({
        fetchUserInfoLoading: true,
        fetchUserThreadsLoading: true,
      });
      this.props.user.removeTargetUserInfo();
      await this.props.user.getTargetUserInfo(query.id);
      this.setWeixinShare();
      this.setState({
        fetchUserInfoLoading: false,
      });
      await this.fetchTargetUserThreads();
    }
  }

  // 设置微信分享内容
  setWeixinShare() {
    setTimeout(() => {
      const { targetUser } = this.props.user;
      if (targetUser) {
        const { nickname, avatarUrl, signature, id } = targetUser;
        const title = `${nickname}的主页`;
        const img = avatarUrl;
        const desc = signature
          ? (signature.length > 35 ? `${signature.substr(0, 35)}...` : signature)
          : '在这里，发现更多精彩内容';
        const link = `${window.location.origin}/user/${id}`;
        setWxShare(title, desc, link, img);
      }
    }, 500);
  }

  componentWillUnmount() {
    this.props.user.removeTargetUserInfo();
  }

  fetchTargetUserThreads = async () => {
    const { query } = this.props.router;
    if (query.id) {
      const targetUserThreadsList = await this.props.index.fetchList({
        namespace: `user/${query.id}`,
        filter: {
          toUserId: query.id,
          complex: 5,
        },
      });
      this.props.index.setList({ namespace: `user/${query.id}`, data: targetUserThreadsList });
    }
    return;
  };

  formatUserThreadsData = (targetUserThreads) => {
    if (Object.keys(targetUserThreads).length === 0) return [];
    return Object.values(targetUserThreads).reduce((fullData, pageData) => [...fullData, ...pageData]);
  };

  handlePreviewBgImage = (e) => {
    e && e.stopPropagation();
    this.setState({
      isPreviewBgVisible: !this.state.isPreviewBgVisible,
    });
  };

  getBackgroundUrl = () => {
    let backgroundUrl = null;
    if (this.props.user?.targetOriginalBackGroundUrl) {
      backgroundUrl = this.props.user?.targetOriginalBackGroundUrl;
    }
    if (!backgroundUrl) return false;
    return backgroundUrl;
  };

  render() {
    const { site, user } = this.props;
    const { platform } = site;
    const { index } = this.props;
    const { lists } = index;

    const { query = {} } = this.props.router;

    const userThreadsList = index.getList({
      namespace: `user/${query.id}`,
    });

    const totalPage = index.getAttribute({
      namespace: `user/${query.id}`,
      key: 'totalPage',
    });

    const totalCount = index.getAttribute({
      namespace: `user/${query.id}`,
      key: 'totalCount',
    });

    const currentPage = index.getAttribute({
      namespace: `user/${query.id}`,
      key: 'currentPage',
    });

    return (
      <BaseLayout
        showHeader={true}
        showTabBar={false}
        immediateCheck={true}
        onRefresh={this.fetchTargetUserThreads}
        noMore={totalPage < currentPage}
        showRefresh={!this.state.fetchUserInfoLoading}
      >
        <div className={styles.mobileLayout}>
          {this.state.fetchUserInfoLoading && (
            <div className={styles.loadingSpin}>
              <Spin type="spinner">加载中...</Spin>
            </div>
          )}
          {!this.state.fetchUserInfoLoading && (
            <>
              <div onClick={this.handlePreviewBgImage}>
                <UserCenterHeaderImage isOtherPerson={true} />
              </div>
              <UserCenterHead platform={platform} isOtherPerson={true} />
            </>
          )}

          <div className={styles.unit}>
            <div className={styles.threadUnit}>
              <div className={styles.threadTitle}>主题</div>
              <div className={styles.threadCount}>{totalCount === undefined ? '' : `${totalCount}个主题`}</div>
            </div>

            <div className={styles.dividerContainer}>
              <Divider className={styles.divider} />
            </div>

            <div className={styles.threadItemContainer}>
              {userThreadsList.length > 0 && (
                  <UserCenterThreads data={userThreadsList} />
              )}
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

export default withRouter(H5OthersPage);
