import React from 'react';
import styles from './index.module.scss';
import Input from '@discuzq/design/dist/components/input/index';
import Button from '@discuzq/design/dist/components/button/index';
import Toast from '@discuzq/design/dist/components/toast/index';
import Icon from '@discuzq/design/dist/components/icon/index';
import { inject, observer } from 'mobx-react';
import Router from '@discuzq/sdk/dist/router';
import { defaultOperation } from '@common/constants/const';
import { THREAD_TYPE } from '@common/constants/thread-post';
import Avatar from '@components/avatar';
import { View, Text } from '@tarojs/components';
import throttle from '@common/utils/thottle.js';

// 用户中心发帖模块
@inject('user')
@inject('threadPost')
@inject('index')
@observer
class UserCenterPost extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isPostDisabled: false, // 表示是否禁用发布按钮
    };
  }

  initState = () => {
    this.setState({
      isPostDisabled: false,
    });
  };

  // 获取发帖相关数据
  handleThreadPostData = async () => {
    const { readPostCategory, setCategorySelected, setPostData } = this.props.threadPost;
    const { code, data = [], msg } = await readPostCategory();
    if (code !== 0) {
      Toast.error({
        content: msg || '获取发帖分类失败',
      });
      return { success: false, msg };
    }
    const parent = data[0];
    const child = !!parent.children.length ? parent.children[0] : {};
    setCategorySelected({ parent, child });
    setPostData({ categoryId: child.pid || parent.pid });
    return { success: true };
  };

  componentDidMount() {
    this.handleThreadPostData();
  }

  handleChange = (e) => {
    this.props.threadPost?.setPostData({ contentText: e.target.value });
  };

  handleClick = throttle(async () => {
    const { createThread, setPostData, postData } = this.props.threadPost;
    if (this.state.isPostDisabled) return;
    if (!postData.contentText) return Toast.info({ content: '请输入发帖内容' });
    // 如果开始没有获取到发帖分类的数据--尝试重新获取
    if (!postData.categoryId) {
      const { success, msg } = await this.handleThreadPostData()
      if (!success) return
    }
    this.setState({
      isPostDisabled: true,
    });
    const result = await createThread();
    if (result.code === 0) {
      Toast.success({
        content: '发布成功',
      });
      setPostData({ contentText: '' });
      this.initState();
      this.props.index.addThread(result.data);
    } else {
      Toast.error({
        content: result.msg || '发布失败',
      });
      this.initState();
    }
  }, 500);

  render() {
    const { user } = this.props;
    return (
      <View
        className={styles.userCenterPost}
        // onClick={() => {
        //   Router.push({ url: '/indexPages/thread/post/index' });
        // }}
      >
        <View className={styles.userCenterPostTitle}>发帖</View>
        <View className={styles.userCenterPostContent}>
          <View className={styles.userCenterPostAvatar}>
            <Avatar image={user.avatarUrl} name={user.nickname} circle />
          </View>
          <View
            style={{
              width: '100%',
            }}
          >
            <View className={styles.userCenterPostInfo}>
              <View className={styles.userCenterPostInput}>
                <Input
                  style={{
                    width: '100%',
                  }}
                  placeholder={'分享新鲜事'}
                  onChange={this.handleChange}
                  value={this.props.threadPost?.postData?.contentText}
                />
              </View>
            </View>
            <View className={styles.userCenterPostBtn}>
              <Button
                disabled={this.state.isPostDisabled}
                onClick={this.handleClick}
                className={styles.btn}
                type="primary"
              >
                发布
              </Button>
            </View>
          </View>
        </View>
        {/* <View className={styles.userCenterPostList}>
          {this.props.user.threadExtendPermissions[THREAD_TYPE.image] && (
            <View className={styles.userCenterPostListItem}>
              <Icon color={'#8590A6'} size={20} name={'PictureOutlinedBig'} />
            </View>
          )}
          {this.props.user.threadExtendPermissions[THREAD_TYPE.video] && (
            <View className={styles.userCenterPostListItem}>
              <Icon color={'#8590A6'} size={20} name={'VideoOutlined'} />
            </View>
          )}
          {this.props.user.threadExtendPermissions[THREAD_TYPE.voice] && (
            <View className={styles.userCenterPostListItem}>
              <Icon color={'#8590A6'} size={20} name={'MicroOutlined'} />
            </View>
          )}
          {this.props.user.threadExtendPermissions[THREAD_TYPE.goods] && (
            <View className={styles.userCenterPostListItem}>
              <Icon color={'#8590A6'} size={20} name={'ShoppingCartOutlined'} />
            </View>
          )}
          {this.props.user.threadExtendPermissions[THREAD_TYPE.reward] && (
            <View className={styles.userCenterPostListItem}>
              <Icon color={'#8590A6'} size={20} name={'QuestionOutlined'} />
            </View>
          )}
          {this.props.user.threadExtendPermissions[defaultOperation.attach] && (
            <View className={styles.userCenterPostListItem}>
              <Icon color={'#8590A6'} size={20} name={'PaperClipOutlined'} />
            </View>
          )}
          {this.props.user.threadExtendPermissions[defaultOperation.redpacket] && (
            <View className={styles.userCenterPostListItem}>
              <Icon color={'#8590A6'} size={20} name={'RedPacketOutlined'} />
            </View>
          )}
          {this.props.user.threadExtendPermissions[defaultOperation.pay] && (
            <View className={styles.userCenterPostListItem}>
              <Icon color={'#8590A6'} size={20} name={'GoldCoinOutlined'} />
            </View>
          )}
        </View> */}
      </View>
    );
  }
}

UserCenterPost.displayName = 'UserCenterPost';

export default UserCenterPost;
