import React from 'react';
import { inject, observer } from 'mobx-react';
import { View } from '@tarojs/components';
import Popup from '@discuzq/design/dist/components/popup/index';
import Icon from '@discuzq/design/dist/components/icon/index';
import Avatar from '@components/avatar';
import '@discuzq/design/dist/styles/index.scss';
import HomeHeader from '@components/home-header';
import UserCenterUsers from '@components/user-center-users';
import { get } from '@common/utils/get';
import Router from '@discuzq/sdk/dist/router';
import { simpleRequest } from '@common/utils/simple-request';
import layout from './index.module.scss';

@inject('site')
@inject('forum')
@inject('user')
@observer
class ForumH5Page extends React.Component {
  async componentDidMount() {
    await this.setUsersPageData(1);
  }

  nextUsersPage = async () => {
    const { forum } = this.props;
    return await this.setUsersPageData(forum.userPage + 1);
  };

  setUsersPageData = async (page = 1) => {
    const { forum } = this.props;
    const usersList = await simpleRequest('readUsersList', {
      params: {
        page,
        filter: {
          hot: 0,
        },
      },
    });
    forum.setUsersPageData(usersList);
  };

  // @TODO
  onUserClick = ({ id }) => {
    Router.push({ url: `/subPages/user/index?id=${id}` });
  };

  render() {
    const { site, forum } = this.props;
    const { usersPageData = [], isNoMore } = forum;
    // 站点介绍
    const { siteIntroduction, envConfig } = site;
    // 创建时间
    const siteInstall = get(site, 'webConfig.setSite.siteInstall', '');
    // 站点模式
    const siteMode = get(site, 'webConfig.setSite.siteMode', '');
    // 站长信息
    const siteAuthor = get(site, 'webConfig.setSite.siteAuthor', '');
    return (
      <>
        <HomeHeader showToolbar fullScreenTitle="站点信息" />
        <View className={layout.content}>
          {/* 站点介绍 start */}
          <View className={layout.list}>
            <View className={layout.label}>站点介绍</View>
            <View className={`${layout.right} ${layout.textEllipsis}`}>{siteIntroduction}</View>
          </View>
          {/* 站点介绍 end */}
          {/* 创建时间 start */}
          <View className={layout.list}>
            <View className={layout.label}>创建时间</View>
            <View className={layout.right}>{siteInstall}</View>
          </View>
          {/* 创建时间 end */}
          {/* 站点模式 start */}
          <View className={layout.list}>
            <View className={layout.label}>站点模式</View>
            <View className={layout.right}>{siteMode === 'public' ? '公开模式' : '付费模式'}</View>
          </View>
          {/* 站点模式 end */}
          {/* 站长 start */}
          <View className={layout.list}>
            <View className={layout.label}>站长</View>
            <View className={layout.right}>
              <View className={layout.forum_agent}>
                <Avatar size="small" className={layout.forum_agent_img} image={siteAuthor.avatar} text={siteAuthor?.nickname?.substring(0, 1)?.toUpperCase()}/>
                <View className={layout.forum_agent_name}>{siteAuthor.nickname}</View>
              </View>
            </View>
          </View>
          {/* 站长 end */}
          {/* 成员 start */}
          <View className={layout.list}>
            <View className={layout.label}>成员</View>
            <View className={layout.right} onClick={() => forum.setIsPopup(true)}>
              <View className={layout.forum_member}>
                {usersPageData?.slice(0, 3).map((item) => (
                  <Avatar
                    size="small"
                    key={item.userId}
                    name={item.nickname}
                    className={layout.forum_member_img}
                    image={item.avatar}
                  />
                ))}
                <Icon color="#8590A6" name="RightOutlined" className={layout.icon} />
              </View>
            </View>
          </View>
          {/* 成员 end */}
          {/* 我的角色 start */}
          <View className={layout.list}>
            <View className={layout.label}>我的角色</View>
            <View className={layout.right}>{this.props.user?.userInfo?.group?.groupName}</View>
          </View>
          {/* 我的角色 end */}
          {/* 当前版本 start */}
          <View className={layout.list}>
            <View className={layout.label}>当前版本</View>
            <View className={layout.right}>{envConfig.version || '暂无版本号'}</View>
          </View>
          {/* 当前版本 end */}
        </View>
        {/* 成员列表弹出 */}
        <Popup
          position="bottom"
          visible={forum.isPopup}
          onClose={() => forum.setIsPopup(false)}
          containerClassName={layout.forum_users_popup}
        >
          <UserCenterUsers onContainerClick={this.onUserClick} />
        </Popup>
      </>
    );
  }
}

export default ForumH5Page;
