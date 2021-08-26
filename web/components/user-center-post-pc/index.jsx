import React from 'react';
import styles from './index.module.scss';
import { Input, Icon } from '@discuzq/design';
import { inject, observer } from 'mobx-react';
import { defaultOperation } from '@common/constants/const';
import { THREAD_TYPE } from '@common/constants/thread-post';
import Router from '@discuzq/sdk/dist/router';
import Avatar from '@components/avatar';

// 用户中心发帖模块
@inject('user')
@observer
class UserCenterPost extends React.Component {
  render() {
    const { user } = this.props;
    return (
      <div
        className={styles.userCenterPost}
        onClick={(event) => {
          Router.push({ url: '/thread/post' });
        }}
      >
        <div className={styles.userCenterPostTitle}>发帖</div>
        <div className={styles.userCenterPostContent}>
          <div className={styles.userCenterPostAvatar}>
            {/* <Avatar text={'黑'} circle /> */}
            <Avatar image={user.avatarUrl} name={user.nickname} circle />
          </div>
          <div
            style={{
              width: '100%',
            }}
          >
            <div className={styles.userCenterPostInfo}>
              <div className={styles.userCenterPostInput}>
                <div className={styles.inputMask}/>
                <Input
                  style={{
                    width: '100%',
                    cursor: 'pointer',
                  }}
                  className={styles.postInput}
                  disabled
                  placeholder={'分享新鲜事'}
                />
              </div>
            </div>
            <div className={styles.userCenterPostList}>
              {this.props.user.threadExtendPermissions[THREAD_TYPE.image] && (
                <div className={styles.userCenterPostListItem}>
                  <Icon color={'#8590A6'} size={20} name={'PictureOutlinedBig'} />
                </div>
              )}
              {this.props.user.threadExtendPermissions[THREAD_TYPE.video] && (
                <div className={styles.userCenterPostListItem}>
                  <Icon color={'#8590A6'} size={20} name={'VideoOutlined'} />
                </div>
              )}
              {this.props.user.threadExtendPermissions[THREAD_TYPE.voice] && (
                <div className={styles.userCenterPostListItem}>
                  <Icon color={'#8590A6'} size={20} name={'MicroOutlined'} />
                </div>
              )}
              {this.props.user.threadExtendPermissions[THREAD_TYPE.goods] && (
                <div className={styles.userCenterPostListItem}>
                  <Icon color={'#8590A6'} size={20} name={'ShoppingCartOutlined'} />
                </div>
              )}
              {this.props.user.threadExtendPermissions[THREAD_TYPE.reward] && (
                <div className={styles.userCenterPostListItem}>
                  <Icon color={'#8590A6'} size={20} name={'QuestionOutlined'} />
                </div>
              )}
              {this.props.user.threadExtendPermissions[defaultOperation.attach] && (
                <div className={styles.userCenterPostListItem}>
                  <Icon color={'#8590A6'} size={20} name={'PaperClipOutlined'} />
                </div>
              )}
              {this.props.user.threadExtendPermissions[defaultOperation.redpacket] && (
                <div className={styles.userCenterPostListItem}>
                  <Icon color={'#8590A6'} size={20} name={'RedPacketOutlined'} />
                </div>
              )}
              {this.props.user.threadExtendPermissions[defaultOperation.pay] && (
                <div className={styles.userCenterPostListItem}>
                  <Icon color={'#8590A6'} size={20} name={'GoldCoinOutlined'} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

UserCenterPost.displayName = 'UserCenterPost';

export default UserCenterPost;
