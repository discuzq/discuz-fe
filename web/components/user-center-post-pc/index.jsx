import React from 'react';
import styles from './index.module.scss';
import { Input, Icon, Button, Toast } from '@discuzq/design';
import { inject, observer } from 'mobx-react';
import { defaultOperation } from '@common/constants/const';
import { THREAD_TYPE } from '@common/constants/thread-post';
import Router from '@discuzq/sdk/dist/router';
import Avatar from '@components/avatar';
import throttle from '@common/utils/thottle.js';
import xss from '@common/utils/xss';

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
    const { readPostCategory, getCategoriesCanCreate, setCategorySelected, setPostData } = this.props.threadPost;
    const { code, msg } = await readPostCategory();
    if (code !== 0) {
      Toast.error({
        content: msg || '获取发帖分类失败',
      });
      return { success: false, msg };
    }
    // 获取可新建发帖的分类
    const data = getCategoriesCanCreate();
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
      const { success, msg } = await this.handleThreadPostData();
      if (!success) return
    }
    this.setState({
      isPostDisabled: true,
    });
    // 对用户中心的postData.contentText做xss处理
    setPostData({ contentText: xss(postData.contentText) });
    const result = await createThread();
    if (result.code === 0) {
      Toast.success({
        content: '发布成功',
      });
      setPostData({ contentText: '' });
      this.initState();
      this.props.index?.addThread(result.data);
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
      <div
        className={styles.userCenterPost}
      // onClick={(event) => {
      //   Router.push({ url: '/thread/post' });
      // }}
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
                {/* <div className={styles.inputMask} /> */}
                <Input
                  style={{
                    width: '100%',
                  }}
                  className={styles.postInput}
                  placeholder={'分享新鲜事'}
                  onChange={this.handleChange}
                  value={this.props.threadPost?.postData?.contentText}
                />
              </div>
            </div>
            <div className={styles.userCenterPostBtn}>
              <Button
                disabled={this.state.isPostDisabled}
                onClick={this.handleClick}
                className={styles.btn}
                type="primary"
              >
                发布
              </Button>
            </div>
            {/* <div className={styles.userCenterPostList}>
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
            </div> */}
          </div>
        </div>
      </div>
    );
  }
}

UserCenterPost.displayName = 'UserCenterPost';

export default UserCenterPost;
