import React from 'react';
import { observer, inject } from 'mobx-react';
import { View } from '@tarojs/components';
import Icon from '@discuzq/design/dist/components/icon/index';
import Badge from '@discuzq/design/dist/components/badge/index';
import styles from './index.module.scss';
import Router from '@discuzq/sdk/dist/router';
import UnreadRedDot from '@components/unread-red-dot';

@inject('user')
@inject('message')
@observer
class UserCenterAction extends React.Component {
  // 点击我的消息
  handleMyMessage = () => {
    Router.push({ url: '/indexPages/message/index' });
  };

  // 点击我的钱包
  handleMyWallet = () => {
    Router.push({ url: '/subPages/wallet/index' });
  };

  // 草稿箱
  handleMyDraft = () => {};

  // 点击我的购买
  handleMyBuy = () => {
    Router.push({ url: '/subPages/my/buy/index' });
  }

  // 点击我的收藏
  handleMyCollect = () => {
    Router.push({ url: '/subPages/my/collect/index' });
  }

  // 草稿箱
  handleMyDraft = () => {
    Router.push({ url: '/subPages/my/draft/index' });
  }

  // 点击站点信息
  handleMySiteInfo = () => {
    Router.push({ url: '/subPages/forum/index' });
  };

  // 点击推广信息
  handleMyInvite = () => {
    Router.push({ url: '/subPages/invite/index' });
  };

  // 点击我的屏蔽
  handleMyBlock = () => {
    Router.push({ url: '/subPages/my/block/index' });
  };

  componentDidMount() {
    this.props.message.readUnreadCount();
  }

  render() {
    const { totalUnread } = this.props.message;
    return (
      <View className={styles.userActionMobile}>
        <View className={styles.userCenterAction}>
          <View className={styles.userCenterActionItemContainer}>
            <View onClick={this.handleMyMessage} className={styles.userCenterActionItem}>
              <View className={styles.userCenterActionItemIcon}>
                <UnreadRedDot unreadCount={totalUnread}>
                  <Icon name={'MailOutlined'} color={'#4F5A70'} size={20} />
                </UnreadRedDot>
              </View>
              <View className={styles.userCenterActionItemDesc}>我的消息</View>
            </View>
          </View>
          <View className={styles.userCenterActionItemContainer}>
            <View onClick={this.handleMyWallet} className={styles.userCenterActionItem}>
              <View className={styles.userCenterActionItemIcon}>
                <Badge>
                  <Icon name={'PayOutlined'} color={'#4F5A70'} size={20} />
                </Badge>
              </View>
              <View className={styles.userCenterActionItemDesc}>我的钱包</View>
            </View>
          </View>

          <View className={styles.userCenterActionItemContainer}>
            <View onClick={this.handleMyCollect} className={styles.userCenterActionItem}>
              <View className={styles.userCenterActionItemIcon}>
                <Badge>
                  <Icon name={'CollectOutlinedBig'} color={'#4F5A70'} size={20} />
                </Badge>
              </View>
              <View className={styles.userCenterActionItemDesc}>我的收藏</View>
            </View>
          </View>

          <View className={styles.userCenterActionItemContainer}>
            <View onClick={this.handleMyBlock} className={styles.userCenterActionItem}>
              <View className={styles.userCenterActionItemIcon}>
                <Badge>
                  <Icon name={'ShieldOutlined'} color={'#4F5A70'} size={20} />
                </Badge>
              </View>
              <View className={styles.userCenterActionItemDesc}>我的屏蔽</View>
            </View>
          </View>
        </View>
        <View className={styles.userCenterAction}>
          <View onClick={this.handleMyBuy} className={styles.userCenterActionItemContainer}>
            <View className={styles.userCenterActionItem}>
              <View className={styles.userCenterActionItemIcon}>
                <Badge>
                  <Icon name={'ShoppingCartOutlined'} color={'#4F5A70'} size={20} />
                </Badge>
              </View>
              <View className={styles.userCenterActionItemDesc}>我的购买</View>
            </View>
          </View>

          <View className={styles.userCenterActionItemContainer}>
            <View onClick={this.handleMyDraft} className={styles.userCenterActionItem}>
              <View className={styles.userCenterActionItemIcon}>
                <Badge>
                  <Icon name={'RetrieveOutlined'} color={'#4F5A70'} size={20} />
                </Badge>
              </View>
              <View className={styles.userCenterActionItemDesc}>我的草稿箱</View>
            </View>
          </View>

          <View className={styles.userCenterActionItemContainer}>
            <View onClick={this.handleMySiteInfo} className={styles.userCenterActionItem}>
              <View className={styles.userCenterActionItemIcon}>
                <Badge>
                  <Icon name={'NotepadOutlined'} color={'#4F5A70'} size={20} />
                </Badge>
              </View>
              <View className={styles.userCenterActionItemDesc}>站点信息</View>
            </View>
          </View>

          <View className={styles.userCenterActionItemContainer} style={{ visibility: this.props.user.isAdmini && 'hidden' }}>
            <View onClick={this.handleMyInvite} className={styles.userCenterActionItem}>
              <View className={styles.userCenterActionItemIcon}>
                <Badge>
                  <Icon name={'NotbookOutlined'} color={'#4F5A70'} size={20} />
                </Badge>
              </View>
              <View className={styles.userCenterActionItemDesc}>推广邀请</View>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

export default UserCenterAction;
