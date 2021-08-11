import React from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import styles from './index.module.scss';
import clearLoginStatus from '@common/utils/clear-login-status';
import UserCenterPost from '@components/user-center-post-pc';
import UserCenterAction from '@components/user-center-action-pc';
import SidebarPanel from '@components/sidebar-panel';
import Avatar from '@components/avatar';
import Copyright from '@components/copyright';
import Router from '@discuzq/sdk/dist/router';
import UserCenterFansPc from '@components/user-center/fans-pc';
import UserCenterFollowsPc from '../../../components/user-center/follows-pc';
import Thread from '@components/thread';
import BaseLayout from '@components/base-layout';
import { Toast } from '@discuzq/design';
import { withRouter } from 'next/router';
import UserCenterHeaderPc from '@components/user-center/header-pc';

@inject('site')
@inject('user')
@inject('index')
@observer
class PCMyPage extends React.Component {
  constructor(props) {
    super(props);
    this.isUnmount = false;

    const myThreadsList = this.props.index.getList({
      namespace: 'my',
    });

    this.state = {
      showFansPopup: false, // 是否弹出粉丝框
      showFollowPopup: false, // 是否弹出关注框
      isLoading: false,
    };

    if (myThreadsList.length === 0) {
     this.state.isLoading = true; 
    }
  }

  beforeRouterChange = (url) => {
    if (url === '/my') {
      return;
    }
    // 如果不是进入 thread 详情页面
    if (!/thread\//.test(url)) {
      this.props.index.clearList({ namespace: 'my' })
    }
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

  async componentDidMount() {
    this.props.router.events.on('routeChangeStart', this.beforeRouterChange);

    await this.props.user.updateUserInfo(this.props.user.id);
    await this.fetchUserThreads();

    this.setState({ isLoading: false });
  }

  componentWillUnmount = () => {
    this.unMount = true;
    this.props.router.events.off('routeChangeStart', this.beforeRouterChange);
  };

  loginOut() {
    clearLoginStatus();
    window.location.replace('/');
  }

  // 点击粉丝更多
  moreFans = () => {
    this.setState({ showFansPopup: true });
  };
  // 点击粉丝关注更多
  moreFollow = () => {
    this.setState({ showFollowPopup: true });
  };

  onContainerClick = ({ id }) => {
    Router.push({ url: `/user/${id}` });
  };

  renderRight = () => {
    // 条件都满足时才显示微信
    const IS_WECHAT_ACCESSABLE = this.props.site.wechatEnv !== 'none' && !!this.props.user.wxNickname;
    return (
      <>
        <SidebarPanel
          platform="h5"
          type="normal"
          title="个人资料"
          isShowMore={true}
          noData={false}
          moreText={'编辑资料'}
          onShowMore={() => {
            Router.push({ url: '/my/edit' });
          }}
          className={`${styles.borderRadius}`}
        >
          {this.props.site?.isSmsOpen && (
            <div className={styles.userInfoWrapper}>
              <div className={styles.userInfoKey}>手机号码</div>
              <div className={styles.userInfoValue}>{this.props.user.mobile || '未绑定'}</div>
            </div>
          )}

          {IS_WECHAT_ACCESSABLE && (
            <div className={styles.userInfoWrapper}>
              <div className={styles.userInfoKey}>微信</div>
              <div className={`${styles.userInfoValue} ${styles.wxContent}`}>
                <Avatar size="small" image={this.props.user.wxHeadImgUrl} name={this.props.user.wxNickname} />
                <span className={styles.wecahtNickname}>{this.props.user.wxNickname}</span>
              </div>
            </div>
          )}

          {/* <div className={styles.userInfoWrapper}>
            <div className={styles.userInfoKey}>实名认证</div>
            <div className={styles.userInfoValue}>去认证</div>
          </div> */}

          <div className={styles.userInfoWrapper}>
            <div className={styles.userInfoKey}>签名</div>
            <div className={styles.userInfoValue}>{this.props.user.signature || '这个人很懒，什么也没留下~'}</div>
          </div>
        </SidebarPanel>

        <UserCenterFansPc userId={this.props.user.id} />

        <UserCenterFollowsPc userId={this.props.user.id} />
        <Copyright />
      </>
    );
  };

  renderContent = () => {
    const { isLoading } = this.state;
    const { user, index } = this.props;
    const { lists } = index;

    const myThreadsList = index.getList({
      namespace: 'my',
    });

    const totalCount = index.getAttribute({
      namespace: 'my',
      key: 'totalCount',
    });

    let showUserThreadsTotalCount = true;

    if (totalCount === undefined || totalCount === null) {
      showUserThreadsTotalCount = false;
    }

    return (
      <div className={styles.userContent}>
        <div className={styles.section}>
          <UserCenterPost />
        </div>
        <div className={styles.section}>
          <UserCenterAction />
        </div>

        <SidebarPanel
          title="主题"
          type="normal"
          isShowMore={false}
          noData={!myThreadsList?.length}
          isLoading={isLoading}
          leftNum={showUserThreadsTotalCount ? `${totalCount}个主题` : ''}
          mold="plane"
        >
          {myThreadsList?.map((item, index) => (
            <Thread
              data={item}
              key={`${item.threadId}-${item.updatedAt}`}
              className={index === 0 && styles.threadStyle}
            />
          ))}
        </SidebarPanel>
      </div>
    );
  };

  render() {
    const { isLoading } = this.state;
    const { index } = this.props;
    const { lists } = index;

    const myThreadsList = index.getList({
      namespace: 'my',
    });

    const totalPage = index.getAttribute({
      namespace: 'my',
      key: 'totalPage',
    });

    const currentPage = index.getAttribute({
      namespace: 'my',
      key: 'currentPage',
    });

    const requestError = index.getListRequestError({ namespace: 'my' });

    // 判断用户信息loading状态
    const IS_USER_INFO_LOADING = !this.props.user?.username;
    // store中，userThreadsPage会比真实页数多1
    let currentPageNum = currentPage;
    if (totalPage > 1) {
      currentPageNum -= 1;
    }

    return (
      <>
        <BaseLayout
          showRefresh={false}
          onSearch={this.onSearch}
          // right={this.renderRight}
          immediateCheck={false}
          curr={'my'}
          pageName="my"
          noMore={totalPage <= currentPage}
          onRefresh={this.fetchUserThreads}
          isShowLayoutRefresh={!isLoading && !!myThreadsList?.length}
          showHeaderLoading={IS_USER_INFO_LOADING}
        >
          <div>
            <div>
              <div className={styles.headerbox}>
                <div className={styles.userHeader}>
                  <UserCenterHeaderPc showHeaderLoading={IS_USER_INFO_LOADING} />
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
