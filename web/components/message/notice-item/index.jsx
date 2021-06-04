/**
 * 消息通知item组件 类型:私信-chat,帖子-thread,财务-financial,账号-account
 *
 * 私信内容：默认展示头像、昵称、时间和一行内容
 * 未读私信内容，在头像上展示未读信息条数，超过99条，则显示99+
 * 点击进入消息页面
 *
 * 帖子通知，原网的系统通知，
 * 头像默认为Q的头像，昵称默认为“内容通知”
 * 通知类型包括：编辑、举报、指定、精华、删除、注册申请、欢迎词、角色变更
 * 左滑出现删除按钮，点击删除可删除通知内容
 *
 * 财务通知，包括打赏收入、红包收入、悬赏收入、付费收入
 * 内容区显示：用户头像、名称、金额、内容、时间（12px）
 * 注：帖子内容中默认显示标题，如果没有标题则显示内容，长度限制为90px
 *
 * 账号消息，@、点赞、回复主题、回复评论
 *
 */
import React, { Component } from 'react';
import { Avatar, Icon } from '@discuzq/design';
import { inject, observer } from 'mobx-react';
import classNames from 'classnames';
import styles from './index.module.scss';
import Router from '@discuzq/sdk/dist/router';
import Toast from '@discuzq/design/dist/components/toast';

import stringToColor from '@common/utils/string-to-color';
import { diffDate } from '@common/utils/diff-date';
import s9e from '@common/utils/s9e';
import xss from '@common/utils/xss';
import PropTypes from 'prop-types';
import UnreadRedDot from '@components/unread-red-dot';

@inject('site')
@observer
class Index extends Component {
  // 获取头像地址,非帖子使用自己的url头像，帖子使用站点logo
  getAvatar = (avatar) => {
    const { type, site } = this.props;
    const url = site?.webConfig?.setSite?.siteFavicon;
    if (type === 'thread') {
      return url || '/dzq-img/default-favicon.png';
    }
    return avatar;
  };

  // 获取头像背景色
  getBackgroundColor = (name) => {
    const character = name?.charAt(0).toUpperCase() || 'a';
    return stringToColor(character);
  };



  // 针对财务消息，获取后缀提示语
  getFinancialTips = (item) => {
    if (item.type === 'rewarded') {
      return '打赏了你';
    }
    if (item.type === 'receiveredpacket') {
      return '获取红包';
    }
    if (item.type === 'threadrewarded') {
      return '悬赏了你';
    }
    if (item.type === 'withdrawal') {
      return '获取提现';
    }
  };

  // 账号信息前置语
  getAccountTips = (item) => {
    switch (item.type) {
      case 'replied':
        return `回复了你的${item.isFirst ? '主题' : '评论'}`;
      case 'related':
        return `@了你`;
      case 'liked':
        return `点赞了你的${item.isFirst ? '主题' : '评论'}`;
    }
  };

  filterTag(html) {
    return html?.replace(/<(\/)?([beprt]|br|div)[^>]*>|[\r\n]/gi, '');
  }

  // parse content 对于需要显示title作为内容的消息，在对应组件内做预处理后统一传入content属性
  parseHTML = () => {
    const { type, item } = this.props;
    let _content = item.content;

    if (type === 'account') {
      const tip = `<span class=\"${styles.tip}\">${this.getAccountTips(item)}</span>`;
      _content = tip + item.content;
    }

    return this.filterTag(xss(s9e.parse(this.filterTag(_content))));
  };

  // 跳转用户中心
  toUserCenter = (e, canJump, item) => {
    e.stopPropagation();
    if (!item.userId) {
      Toast.error({
        content: '没有用户id',
        hasMask: false,
        duration: 1000,
      });
    } else {
      // 后续用户中心做好后，需拼接用户id
      canJump && Router.push({ url: `/user/${item.userId}` });
    }

  };

  // 跳转主题详情or私信
  toDetailOrChat = (e, item) => {
    if (e.target.nodeName === 'A') return;
    const { type } = this.props;
    if (type === 'financial' || type === 'account') {
      Router.push({ url: `/thread/${item.threadId}` });
    }
    if (type === 'chat') {
      Router.push({ url: `/message?page=chat&dialogId=${item.dialogId}&username=${item.username}` });
    }
  };

  render() {
    const { type, item = {}, site, onBtnClick, isLast } = this.props;
    const { isPC } = site;
    const avatarUrl = this.getAvatar(item.avatar);

    return (
      <div className={styles.wrapper} onClick={(e) => this.toDetailOrChat(e, item)}>
        {/* 默认block */}
        <div className={isPC ? styles['block-pc'] : styles.block}>
          {/* 头像 */}
          <div className={styles.avatar} onClick={(e) => this.toUserCenter(e, type !== 'thread', item)}>

            {/* 未读消息红点 */}
            <UnreadRedDot type='avatar' unreadCount={item.unreadCount}>
              {
                avatarUrl ? (
                  <Avatar image={avatarUrl} circle={true} />
                ) : (
                  <Avatar
                    text={item.username}
                    circle={true}
                    style={{
                      backgroundColor: `#${this.getBackgroundColor(item.username)}`,
                    }}
                  />
                )
              }
            </UnreadRedDot>

          </div>
          {/* 详情 */}
          <div
            className={classNames(styles.detail, {
              [styles['detail-chat']]: type === 'chat',
              [styles['detail-thread']]: type === 'thread',
              [styles['detail-financial']]: type === 'financial',
              [styles['detail-account']]: type === 'account',
              [styles['border-none']]: isLast,
            })}
          >
            {/* 顶部 */}
            <div className={styles.top}>
              <div
                className={classNames(styles.name, {
                  [styles['single-line']]: true,
                })}
                onClick={(e) => this.toUserCenter(e, type !== 'thread', item)}
              >
                {/* 仅帖子通知没有username，使用title代替显示 */}
                {item.username || this.filterTag(item.title)}
              </div>
              {['chat', 'thread'].includes(type) && (
                <div className={styles.time}>{diffDate(item.createdAt)}</div>
              )}
              {type === 'financial' && <div className={styles.amount}>+{parseFloat(item.amount).toFixed(2)}</div>}
            </div>

            {/* 中部 */}
            <div className={classNames(styles.middle)}>
              {/* 财务内容 */}
              {type === 'financial' && (
                <p className={styles['content-html']} style={isPC ? { paddingRight: '20px' } : {}}>
                  在帖子"
                  <span
                    className={`${styles['financial-content']} ${styles['single-line']}`}
                    style={{
                      maxWidth: `${isPC ? '400px' : '90px'}`,
                      display: 'inline-block',
                      verticalAlign: 'bottom',
                    }}
                    dangerouslySetInnerHTML={{ __html: this.parseHTML() }}
                  />
                  "中{this.getFinancialTips(item)}
                </p>
              )}
              {/* 私信、帖子、账户 */}
              {['chat', 'thread', 'account'].includes(type) && (
                <p
                  className={classNames(styles['content-html'], {
                    [styles['single-line']]: ['chat'].includes(type),
                    [styles['multiple-line']]: ['thread', 'account'].includes(type),
                  })}
                  style={isPC ? { paddingRight: '20px' } : {}}
                  dangerouslySetInnerHTML={{ __html: this.parseHTML() }}
                />
              )}
            </div>

            {/* 底部 */}
            {['financial', 'account'].includes(type) && (
              <div className={`${styles.bottom} ${styles.time}`}>{diffDate(item.createdAt)}</div>
            )}
          </div>
        </div>
        {/* PC删除 */}
        {isPC && (
          <div
            className={styles.delete}
            onClick={(e) => {
              e.stopPropagation();
              onBtnClick(item);
            }}
          >
            <Icon className={styles.icon} name="DeleteOutlined" size={14} />
          </div>
        )}
      </div>
    );
  }
}

Index.propTypes = {
  type: PropTypes.string,
  item: PropTypes.object,
  onBtnClick: PropTypes.func,
};

Index.defaultProps = {
  type: 'thread',
  item: {},
  onBtnClick: () => { },
};

export default Index;
