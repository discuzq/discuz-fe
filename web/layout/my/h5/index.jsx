import React from 'react';
import styles from './index.module.scss';
import { Divider, Spin, Toast } from '@discuzq/design';
import UserCenterHeaderImage from '@components/user-center-header-images';
import UserCenterHead from '@components/user-center-head';
import { inject, observer } from 'mobx-react';
import UserCenterPost from '@components/user-center-post';
import UserCenterAction from '@components/user-center-action';
import UserCenterThreads from '@components/user-center-threads';
import BaseLayout from '@components/base-layout';
import NoData from '@components/no-data';

@inject('site')
@inject('user')
@observer
class H5MyPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstLoading: true,
    };
  }

  componentDidMount = async () => {
    await this.props.user.updateUserInfo(this.props.user.id);

    try {
      await this.props.user.getUserThreads();
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
    this.setState({
      firstLoading: false,
    });
  };

  formatUserThreadsData = (userThreads) => {
    if (Object.keys(userThreads).length === 0) return [];
    return Object.values(userThreads).reduce((fullData, pageData) => [...fullData, ...pageData]);
  };

  render() {
    const { site, user } = this.props;
    const { platform } = site;
    const { userThreads, userThreadsTotalCount, userThreadsPage, userThreadsTotalPage } = user;
    const formattedUserThreads = this.formatUserThreadsData(userThreads);

    return (
      <BaseLayout
        curr={'my'}
        showHeader={false}
        showTabBar={true}
        onRefresh={user.getUserThreads}
        noMore={userThreadsTotalPage <= userThreadsPage}
        showRefresh={!this.state.firstLoading}
        immediateCheck
      >
        <div className={styles.mobileLayout}>
          <UserCenterHeaderImage />
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
              <div className={styles.threadCount}>{userThreadsTotalCount}个主题</div>
            </div>

            <div className={styles.dividerContainer}>
              <Divider className={styles.divider} />
            </div>

            <div className={styles.threadItemContainer}>
              {this.state.firstLoading && (
                <div className={styles.spinLoading}>
                  <Spin type="spinner">加载中...</Spin>
                </div>
              )}
              {formattedUserThreads?.length > 0 && <UserCenterThreads data={formattedUserThreads} />}
            </div>
          </div>
        </div>
      </BaseLayout>
    );
  }
}

export default H5MyPage;
