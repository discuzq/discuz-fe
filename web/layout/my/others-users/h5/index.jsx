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

@inject('site')
@inject('user')
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

    if (String(this.targetUserId) === String(query.id)) return;
    this.targetUserId = query.id;
    if (query.id) {
      this.setState({
        fetchUserInfoLoading: true,
        fetchUserThreadsLoading: true
      });
      this.props.user.removeTargetUserInfo();
      await this.props.user.getTargetUserInfo(query.id);
      this.setState({
        fetchUserInfoLoading: false,
      });
      await this.fetchTargetUserThreads();
    }
  }

  componentWillUnmount() {
    this.props.user.removeTargetUserInfo();
  }

  fetchTargetUserThreads = async () => {
    const { query } = this.props.router;
    if (query.id) {
      await this.props.user.getTargetUserThreads(query.id);
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
    if (this.props.user?.targetUserBackgroundUrl) {
      backgroundUrl = this.props.user?.targetUserBackgroundUrl;
    }
    if (!backgroundUrl) return false;
    return backgroundUrl;
  };

  render() {
    const { site, user } = this.props;
    const { platform } = site;
    const { targetUserThreads, targetUserThreadsTotalCount, targetUserThreadsPage, targetUserThreadsTotalPage } = user;
    return (
      <BaseLayout
        showHeader={true}
        showTabBar={false}
        immediateCheck={true}
        onRefresh={this.fetchTargetUserThreads}
        noMore={targetUserThreadsTotalPage < targetUserThreadsPage}
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
              <div className={styles.threadCount}>{targetUserThreadsTotalCount}个主题</div>
            </div>

            <div className={styles.dividerContainer}>
              <Divider className={styles.divider} />
            </div>

            <div className={styles.threadItemContainer}>
              {this.formatUserThreadsData(targetUserThreads) &&
                this.formatUserThreadsData(targetUserThreads).length > 0 && (
                  <UserCenterThreads data={this.formatUserThreadsData(targetUserThreads)} />
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
