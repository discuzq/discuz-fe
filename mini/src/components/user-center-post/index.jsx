import React from 'react';
import { inject, observer } from 'mobx-react';
import { View } from '@tarojs/components';
import Input from '@discuzq/design/dist/components/input/index';
import Button from '@discuzq/design/dist/components/button/index';
import Toast from '@discuzq/design/dist/components/toast/index';
import Avatar from '@components/avatar';
import throttle from '@common/utils/thottle.js';
import debounce from '@common/utils/debounce.js';
import styles from './index.module.scss';

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
      value: '',
    };
  }

  componentDidMount() {
    this.handleThreadPostData();
  }

  initState = () => {
    this.setState({
      isPostDisabled: false,
      value: '',
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
    const parent = data[0] || {};
    const child = !!parent.children.length ? parent.children[0] : {};
    setCategorySelected({ parent, child });
    setPostData({ categoryId: child.pid || parent.pid });
    return { success: true };
  };

  handleClick = throttle(async () => {
    if (this.state.isPostDisabled) return;
    if (!this.state.value) return Toast.info({ content: '请输入发帖内容' });
    Toast.loading({
      content: '发布中...',
    });
    const { createThread, setPostData, postData } = this.props.threadPost;
    setPostData({ contentText: this.state.value });

    // 如果开始没有获取到发帖分类的数据--尝试重新获取
    if (!postData.categoryId) {
      const { success } = await this.handleThreadPostData()
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
  }, 100);

  render() {
    const { user } = this.props;
    return (
      <View className={styles.userCenterPost}>
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
                  placeholder='分享新鲜事'
                  value={this.state.value}
                  onChange={debounce((e) => {
                    this.setState({
                      value: e.target.value
                    })
                  }, 300)}
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
      </View>
    );
  }
}

UserCenterPost.displayName = 'UserCenterPost';

export default UserCenterPost;
