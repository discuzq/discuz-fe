import React from 'react';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';
import clearLoginStatus from '@common/utils/clear-login-status';
import UserCenterPost from '@components/user-center-post-pc';
import UserCenterAction from '@components/user-center-action-pc';
import UserBaseLaout from '@components/user-center-base-laout-pc';
import SidebarPanel from '@components/sidebar-panel';
import Avatar from '@components/avatar';
import Copyright from '@components/copyright';
import List from '@components/list';
import Router from '@discuzq/sdk/dist/router';
import UserCenterFollowPopup from '@components/user-center-follow-popup';
import UserCenterThreads from '@components/user-center-threads';
import NoData from '@components/no-data';
import UserCenterFansPc from '@components/user-center/fans-pc';
import UserCenterFollowsPc from '../../../components/user-center/follows-pc';
import Thread from '@components/thread';
import SectionTitle from '@components/section-title';
import BaseLayout from '../../../components/user-center-base-laout-pc';
import { Toast } from '@discuzq/design';

@inject('site')
@inject('user')
@observer
class PCMyPage extends React.Component {
  constructor(props) {
    super(props);
    this.isUnmount = false;
    this.state = {
      showFansPopup: false, // 是否弹出粉丝框
      showFollowPopup: false, // 是否弹出关注框
      isLoading: true,
    };
  }

  fetchUserThreads = async () => {
    try {
      const userThreadsList = await this.props.user.getUserThreads();
      if (!this.unMount) {
        this.props.user.setUserThreads(userThreadsList);
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
  }

  async componentDidMount() {
    await this.props.user.updateUserInfo(this.props.user.id);
    await this.fetchUserThreads();

    this.setState({ isLoading: false });
  }


  componentWillUnmount = () => {
    this.unMount = true;
    this.props.user.clearUserThreadsInfo();
  }

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

  formatUserThreadsData = (userThreads) => {
    if (Object.keys(userThreads).length === 0) return [];
    return Object.values(userThreads).reduce((fullData, pageData) => [...fullData, ...pageData]);
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
                <Avatar size="small" image={this.props.user.wxHeadImgUrl} name={this.props.user.wxNickname}/>
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
    const { user } = this.props;
    const { userThreads, userThreadsTotalCount } = user;
    const formattedUserThreads = this.formatUserThreadsData(userThreads);
    let showUserThreadsTotalCount = true;

    if (userThreadsTotalCount === undefined || userThreadsTotalCount === null) {
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
          noData={!formattedUserThreads?.length}
          isLoading={isLoading}
          leftNum={showUserThreadsTotalCount ? `${userThreadsTotalCount}个主题` : ''}
          mold="plane"
        >
          {formattedUserThreads?.map((item, index) => (
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
    const { user } = this.props;
    const { userThreadsPage, userThreadsTotalPage, getUserThreads, userThreads } = user;
    const formattedUserThreads = this.formatUserThreadsData(userThreads);
    // 判断用户信息loading状态
    const IS_USER_INFO_LOADING = !this.props.user?.username;
    // store中，userThreadsPage会比真实页数多1
    let currentPageNum = userThreadsPage;
    if (userThreadsTotalPage > 1) {
      currentPageNum -= 1;
    }

    return (
      <>
        <BaseLayout
          showRefresh={false}
          right={this.renderRight}
          immediateCheck={false}
          noMore={userThreadsTotalPage <= currentPageNum}
          onRefresh={this.fetchUserThreads}
          showLayoutRefresh={!isLoading && !!formattedUserThreads?.length}
          showHeaderLoading={IS_USER_INFO_LOADING}
        >
          {this.renderContent()}
        </BaseLayout>
      </>
    );
  }
}

export default PCMyPage;
