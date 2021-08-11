import React from 'react';
import styles from './index.module.scss';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import BaseLayout from '@components/base-layout';
import SidebarPanel from '@components/sidebar-panel';
import Copyright from '@components/copyright';
import { withRouter } from 'next/router';
import UserCenterFansPc from '@components/user-center/fans-pc';
import UserCenterFollowsPc from '@components/user-center/follows-pc';
import Router from '@discuzq/sdk/dist/router';
import UserCenterThreads from '@components/user-center-threads';
import UserCenterHeaderPc from '@components/user-center/header-pc';

@inject('site')
@inject('index')
@inject('user')
@observer
class PCMyPage extends React.Component {
  targetUserId = null;
  constructor(props) {
    super(props);
    this.props.user.cleanTargetUserThreads();
    this.state = {
      showFansPopup: false, // 是否弹出粉丝框
      showFollowPopup: false, // 是否弹出关注框
      fetchUserInfoLoading: true,
      fetchUserThreadsLoading: true,
    };
  }

  fansPopupInstance = null;
  followsPopupInstance = null;

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
      this.targetUserId = query.id;
      await this.props.user.getTargetUserInfo(query.id);
      this.setState({
        fetchUserInfoLoading: false,
      });
    }
  };

  componentDidUpdate = async () => {
    const { query } = this.props.router;
    const id = this.props.user?.id;

    if (String(id) === query.id) {
      Router.replace({ url: '/my' });
      return;
    }

    if (String(this.targetUserId) === String(query.id)) return;
    this.targetUserId = query.id;
    if (query.id) {
      if (this.fansPopupInstance) {
        this.fansPopupInstance.closePopup();
      }

      if (this.followsPopupInstance) {
        this.followsPopupInstance.closePopup();
      }

      this.setState({
        fetchUserInfoLoading: true,
        fetchUserThreadsLoading: true,
      });
      this.props.user.removeTargetUserInfo();
      await this.props.user.getTargetUserInfo(query.id);
      this.setState({
        fetchUserInfoLoading: false,
      });
      await this.fetchTargetUserThreads();
    }
  };

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
      this.setState({
        fetchUserThreadsLoading: false,
      });
    }
    return;
  };

  formatUserThreadsData = (targetUserThreads) => {
    if (Object.keys(targetUserThreads).length === 0) return [];
    return Object.values(targetUserThreads).reduce((fullData, pageData) => [...fullData, ...pageData]);
  };

  // 点击粉丝更多
  moreFans = () => {
    this.setState({ showFansPopup: true });
  };

  // 点击粉丝关注更多
  moreFollow = () => {
    this.setState({ showFollowPopup: true });
  };

  onSearch = (value) => {
    this.props.router.replace(`/search?keyword=${value}`);
  };

  renderRight = () => {
    const { query } = this.props.router;
    const id = query?.id;
    return (
      <>
        <UserCenterFansPc userId={id} getRef={instance => (this.fansPopupInstance = instance)} />

        <UserCenterFollowsPc userId={id} getRef={instance => (this.followsPopupInstance = instance)} />
        <Copyright />
      </>
    );
  };

  renderContent = () => {
    const { fetchUserThreadsLoading } = this.state;
    const { index } = this.props;
    const { lists } = index;

    const { query = {} } = this.props.router;

    const userThreadsList = index.getList({
      namespace: `user/${query.id}`,
    });

    const totalCount = index.getAttribute({
      namespace: `user/${query.id}`,
      key: 'totalCount',
    });

    const requestError = index.getListRequestError({ namespace: `user/${query.id}` });

    return (
      <div className={styles.userContent}>
        <SidebarPanel
          title="主题"
          type="normal"
          bigSize={true}
          isShowMore={false}
          isLoading={fetchUserThreadsLoading}
          leftNum={totalCount !== undefined ? `${totalCount}个主题` : ''}
          noData={!userThreadsList?.length}
          mold="plane"
          isError={requestError.isError}
          errorText={requestError.errorText}
        >
          {userThreadsList.length > 0 && <UserCenterThreads data={userThreadsList} />}
        </SidebarPanel>
      </div>
    );
  };

  render() {
    const { fetchUserInfoLoading } = this.state;
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

    const currentPage = index.getAttribute({
      namespace: `user/${query.id}`,
      key: 'currentPage',
    });

    return (
      <>
        <BaseLayout
          isOtherPerson={true}
          allowRefresh={false}
          onRefresh={this.fetchTargetUserThreads}
          noMore={totalPage < currentPage}
          showRefresh={false}
          onSearch={this.onSearch}
          immediateCheck={true}
          isShowLayoutRefresh={!!userThreadsList?.length && !fetchUserInfoLoading}
          showHeaderLoading={fetchUserInfoLoading}
        >
          <div>
            <div>
              <div className={styles.headerbox}>
                <div className={styles.userHeader}>
                  <UserCenterHeaderPc showHeaderLoading={fetchUserInfoLoading} />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.userCenterBody}>
            <div className={classnames(styles.userCenterBodyItem, styles.userCenterBodyLeftItem)}>
              {this.renderContent()}
            </div>
            <div className={classnames(styles.userCenterBodyItem, styles.userCenterBodyRightItem)}>
              {this.renderRight()}
            </div>
          </div>
        </BaseLayout>
      </>
    );
  }
}

export default withRouter(PCMyPage);
