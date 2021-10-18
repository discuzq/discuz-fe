import React from 'react';
import { Icon } from '@discuzq/design';
import styles from './index.module.scss';
import Router from '@discuzq/sdk/dist/router';
import { observer, inject } from 'mobx-react';
import UnreadRedDot from '@components/unread-red-dot';
@inject('user')
@inject('message')
@inject('site')
@observer
class UserCenterAction extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      actions: [
        {
          cid: 'message',
          name: '我的消息',
          url: '/message',
          iconName: 'MailOutlined',
          totalUnread: 9
        },
        {
          cid: 'wallet',
          name: '我的钱包',
          url: '/wallet',
          iconName: 'PayOutlined'

        },
        {
          cid: 'collect',
          name: '我的收藏',
          url: '/my/collect',
          iconName: 'CollectOutlinedBig'

        },
        {
          cid: 'like',
          name: '我的点赞',
          url: '/my/like',
          iconName: 'LikeOutlined'

        },
        {
          cid: 'block',
          name: '我的屏蔽',
          url: '/my/block',
          iconName: 'ShieldOutlined'

        },
        {
          cid: 'buy',
          name: '我的购买',
          url: '/my/buy',
          iconName: 'ShoppingCartOutlined'

        },
        {
          cid: 'draft',
          name: '我的草稿箱',
          url: '/my/draft',
          iconName: 'RetrieveOutlined'

        },
        {
          cid: 'forum',
          name: '站点信息',
          url: '/forum',
          iconName: 'NotepadOutlined'

        },
        {
          cid: 'invite',
          name: '推广邀请',
          url: '/invite',
          iconName: 'NotbookOutlined'

        },
        {
          cid: 'shopOutlined',
          name: '商城',
          url: '',
          iconName: 'ShopOutlined'

        }
      ]
    }
  }

  handleActionItem = (item) => {
    if (item.url) {
      Router.push({ url: item.url });
    }
  }

  componentDidMount() {
    this.props.message.readUnreadCount();
    const actions = this.state.actions.slice()

    // 管理员去除 推广邀请配置
    if (this.props.user.isAdmini) {
      const inviteIndex = this.state.actions.findIndex(item => item.cid === 'invite')
      inviteIndex > -1 && actions.splice(inviteIndex, 1)
    }
    // h5 去除 我的点赞 配置
    if(this.props.site.platform !== 'pc') {
      const likeIndex = this.state.actions.findIndex(item => item.cid === 'like')
      likeIndex > -1 && actions.splice(likeIndex, 1)
    }

    this.setState({actions})
  }

  render() {
    const { message } = this.props;
    const { totalUnread } = message;
    return (
      <div className={`${styles.userCenterAction} ${this.props.user.isAdmini && styles.userCenterColumnStyle} ${this.props.site.platform === 'pc' ? styles.pc : styles.h5}`}>
        {
          this.state.actions.map((item, index) => (
            <div onClick={() => {this.handleActionItem(item)}} className={styles.userCenterActionItem}>
            <div className={styles.userCenterActionItemIcon}>
              {
                item.cid === 'message' ?
                <UnreadRedDot unreadCount={totalUnread}>
                  <Icon name={item.iconName} size={20} />
                </UnreadRedDot>
                :
                <Icon name={item.iconName} size={20} />
              }
            </div>
            <div className={styles.userCenterActionItemDesc}>{item.name}</div>
            </div>
          ))
        }
      </div>
    );
  }
}

export default UserCenterAction;
