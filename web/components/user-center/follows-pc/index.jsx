import React from 'react';
import SidebarPanel from '@components/sidebar-panel';
import UserCenterFollowPopup from '@components/user-center-follow-popup';
import { inject, observer } from 'mobx-react';
import Router from '@discuzq/sdk/dist/router';
import styles from './index.module.scss';
import UserCenterFollows from '../../user-center-follow';
import { withRouter } from 'next/router';

@inject('user')
@observer
class UserCenterFollowsPc extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showFollowsPopup: false,
    };
  }

  // 点击粉丝更多
  moreFollow = () => {
    this.setState({ showFollowsPopup: true });
  };

  render() {
    const followCount = this.props.userId ? this.props.user.targetUserFollowCount : this.props.user.followCount;
    return (
      <>
        <SidebarPanel
          type="normal"
          noData={Number(followCount) === 0}
          title="关注"
          leftNum={followCount}
          onShowMore={this.moreFollow}
        >
          {Number(followCount) !== 0 && (
            <UserCenterFollows
              style={{
                overflow: 'hidden',
              }}
              userId={this.props.userId}
              onContainerClick={({ id }) => {
                this.props.router.push({
                  pathname: '/user/[id]',
                  query: {
                    id,
                  },
                });
              }}
              itemStyle={{
                paddingLeft: 0,
                paddingRight: 0,
              }}
              className={styles.friendsWrapper}
              limit={5}
            />
          )}
        </SidebarPanel>

        <UserCenterFollowPopup
          id={this.props.userId}
          visible={this.state.showFollowsPopup}
          onContainerClick={({ id }) => {
            this.props.router.push({
              pathname: '/user/[id]',
              query: {
                id,
              },
            });
          }}
          onClose={() => this.setState({ showFollowsPopup: false })}
        />
      </>
    );
  }
}

export default withRouter(UserCenterFollowsPc);
