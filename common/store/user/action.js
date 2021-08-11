import { action } from 'mobx';
import SiteStore from './store';
import {
  readUser,
  readPermissions,
  createFollow,
  deleteFollow,
  getUserFollow,
  getUserFans,
  readThreadList,
  denyUser,
  deleteDeny,
  updateAvatar,
  updateBackground,
  updateUsersUpdate,
  smsSend,
  smsRebind,
  smsVerify,
  readUsersDeny,
  wechatRebindQrCodeGen,
  getWechatRebindStatus,
  getSignInFields,
  h5Rebind,
  miniRebind,
} from '@server';
import { get } from '../../utils/get';
import set from '../../utils/set';
import typeofFn from '@common/utils/typeof';
import threadReducer from '../thread/reducer';
import locals from '@common/utils/local-bridge';
import constants from '@common/constants';

class UserAction extends SiteStore {
  constructor(props) {
    super(props);
  }

  // 获取指定 userid 的 用户信息
  getTargetUserInfo({ userId }) {

  }

  // 拉取指定 userid 的 用户信息
  fetchTargetUserInfo({ userId }) {

  }

  // 设置指定 userid 的 用户信息
  setTargetUserInfo({
    userId,
    userInfo,
  }) {

  }

  // 更新指定 userid 的 用户信息
  updateTargetUserInfo({
    userId,
    updater,
  }) {

  }

  // 删除指定 userid 的 用户信息
  deleteTargetUserInfo({
    userId,
  }) {

  }

  // 获取指定用户的关注
  getTargetUserFollowers({ userId, page }) {

  }

  // 获取指定用户的粉丝
  getTargetUserFanses({ userId, page }) {

  }

  // 获取用户的关注者
  getUserFollowers({ page }) {

  }

  // 获取用户的粉丝
  getUserFanses({ page }) {

  }

  @action
  removeUserInfo() {
    this.userInfo = null;
    this.loginStatus = false;
    this.accessToken = null;
  }

  // 写入用户数据
  @action
  setUserInfo(data) {
    if (data) {
      if (!this.userInfo) {
        this.userInfo = data;
      } else {
        Object.keys(data).forEach((key) => {
          this.userInfo[key] = data[key];
        });
      }
      if (data && data.id) {
        this.updateLoginStatus(true);
      } else {
        this.updateLoginStatus(false);
      }
    }
  }

  // 写入用户发帖权限
  @action
  async setUserPermissions(data) {
    this.permissions = data;
  }

  // 获取用户分享时的名称和头像
  @action.bound
  getShareData(data) {
    this.shareNickname = data.nickname;
    this.shareAvatar = data.avatar;
    this.shareThreadid = data.threadId;
  }

  // 获取用户分享前的内容
  @action.bound
  getShareContent(data) {
    this.shareThreadid = data.threadId;
    this.shareContent = data.content;
  }

  // 初始化编辑用用户信息
  @action
  initEditInfo() {
    this.editNickName = get(this.userInfo, 'nickname');
    this.editUserName = get(this.userInfo, 'username');
    this.editSignature = get(this.userInfo, 'signature');
    // this.editAvatarUrl = get(this.userInfo, 'avatarUrl');
    // this.editBackgroundUrl = get(this.userInfo, 'backgroundUrl');
  }

  @action
  diffPicAndUpdateUserInfo(data) {
    const transformedData = Object.assign({}, data);

    // 如下操作是为了避免因为签名导致的图片重加载问题
    if (data.backgroundUrl && this.backgroundUrl) {
      const originBackgroundFilename = this.backgroundUrl?.split('?')[0];
      const nextBackgroundFilename = data.backgroundUrl?.split('?')[0];

      if (originBackgroundFilename === nextBackgroundFilename) {
        transformedData.backgroundUrl = this.backgroundUrl;
      }
    }

    if (data.avatarUrl && this.avatarUrl) {
      const originAvatarFilename = this.avatarUrl?.split('?')[0];
      const nextAvatarFilename = data.avatarUrl?.split('?')[0];

      if (originAvatarFilename === nextAvatarFilename) {
        transformedData.avatarUrl = this.avatarUrl;
      }
    }

    this.setUserInfo(transformedData);
  }

  // 登录后获取新的用户信息
  @action
  async updateUserInfo(id) {
    const userInfo = await readUser({ params: { pid: id } });
    if (!userInfo || userInfo?.code !== 0) {
      return;
    }

    if (!this.id && this.onLoginCallback) {
      this.onLoginCallback(userInfo.data);
    }
    const userPermissions = await readPermissions({});
    userInfo?.data && this.diffPicAndUpdateUserInfo(userInfo.data);
    userPermissions?.data && this.setUserPermissions(userPermissions.data);

    return userInfo?.code === 0 && userInfo.data;
  }

  @action
  diffPicAndUpdateTargetUserInfo(data) {
    const transformedData = Object.assign({}, data);

    // 如下操作是为了避免因为签名导致的图片重加载问题
    if (data.backgroundUrl && this.targetUserBackgroundUrl) {
      const originBackgroundFilename = this.targetUserBackgroundUrl?.split('?')[0];
      const nextBackgroundFilename = data.backgroundUrl?.split('?')[0];

      if (originBackgroundFilename === nextBackgroundFilename) {
        transformedData.backgroundUrl = this.targetUserBackgroundUrl;
      }
    }

    if (data.avatarUrl && this.targetUserAvatarUrl) {
      const originAvatarFilename = this.targetUserAvatarUrl?.split('?')[0];
      const nextAvatarFilename = data.avatarUrl?.split('?')[0];

      if (originAvatarFilename === nextAvatarFilename) {
        transformedData.avatarUrl = this.targetUserAvatarUrl;
      }
    }

    return transformedData;
  }

  // 获取指定用户的用户信息，用于获取他人首页
  @action
  async getTargetUserInfo(id) {
    this.targetUserId = id;
    const userInfo = await this.getAssignUserInfo(id);
    this.targetUser = this.diffPicAndUpdateTargetUserInfo(userInfo);
    return userInfo;
  }

  @action
  getUserFollow = async () => {
    const followsRes = await getUserFollow({
      params: {
        page: this.userFollowsPage,
        perPage: 20,
      },
    });

    if (followsRes.code !== 0) {
      console.error(followsRes);
      return;
    }

    const pageData = get(followsRes, 'data.pageData', []);
    const totalPage = get(followsRes, 'data.totalPage', 1);
    this.userFollowsTotalPage = totalPage;
    this.userFollows[this.userFollowsPage] = pageData;
    if (this.userFollowsPage <= this.userFollowsTotalPage) {
      this.userFollowsPage += 1;
    }
    this.userFollows = { ...this.userFollows };
  };

  @action
  getUserFans = async () => {
    const fansRes = await getUserFans({
      params: {
        page: this.userFansPage,
        perPage: 20,
      },
    });

    if (fansRes.code !== 0) {
      console.error(fansRes);
      return;
    }

    const pageData = get(fansRes, 'data.pageData', []);
    const totalPage = get(fansRes, 'data.totalPage', 1);
    this.userFans[this.userFansPage] = pageData;
    this.userFansTotalPage = totalPage;
    this.userFans[this.userFansPage] = pageData;
    if (this.userFansPage <= this.userFansTotalPage) {
      this.userFansPage += 1;
    }
    this.userFans = { ...this.userFans };
  };

  /**
   * 取消屏蔽指定 id 的用户
   * @param {*} id
   */
  @action
  async undenyUser(id) {
    const deleteDenyRes = await deleteDeny({
      data: {
        id,
      },
    });

    if (deleteDenyRes.code === 0) {
      return deleteDenyRes.data;
    }

    throw {
      Code: deleteDenyRes.code,
      Msg: deleteDenyRes.msg,
    };
  }

  /**
   * 屏蔽指定  id 的用户
   * @param {*} id
   */
  @action
  async denyUser(id) {
    const denyUserRes = await denyUser({
      data: {
        id,
      },
    });

    if (denyUserRes.code === 0) {
      return denyUserRes.data;
    }

    throw {
      Code: denyUserRes.code,
      Msg: denyUserRes.msg,
    };
  }

  // 更新是否没有用户数据状态
  @action
  updateLoginStatus(isLogin) {
    this.loginStatus = isLogin;
  }

  @action
  removeUserInfo() {
    this.userInfo = null;
    this.permissions = null;
    this.noUserInfo = false;
  }

  @action
  setAccessToken(accessToken) {
    this.accessToken = accessToken;
  }

  // 判断用户是否登录
  @action
  isLogin() {
    if (process.env.DISCUZ_ENV !== 'web') {
      return !!locals.get(constants.ACCESS_TOKEN_NAME);
    }

    return !!this.userInfo && !!this.userInfo.id;
  }

  @action
  isPaid() {
    return !!this.userInfo && !!this.userInfo.paid;
  }

  // 获取指定用户信息
  @action
  async getAssignUserInfo(userId) {
    try {
      const userInfo = await readUser({ params: { pid: userId } });
      if (userInfo.code === 0 && userInfo.data) {
        return userInfo.data;
      }
      return null;
    } catch (err) {
      return null;
    }
  }

  @action
  setTargetUserDenied() {
    set(this.targetUser, 'isDeny', true);
  }

  @action
  setTargetUserNotBeDenied() {
    set(this.targetUser, 'isDeny', false);
  }

  /**
   * 关注
   * @param {object} userId * 被关注人id
   * @returns {object} 处理结果
   */
  @action
  async postFollow(userId) {
    const res = await createFollow({ data: { toUserId: userId } });
    if (res.code === 0 && res.data) {
      return {
        msg: '操作成功',
        data: res.data,
        success: true,
      };
    }
    return {
      msg: res.msg,
      data: null,
      success: false,
    };
  }

  /**
   * 取消关注
   * @param {object} search * 搜索值
   * @returns {object} 处理结果
   */
  @action
  async cancelFollow({ id, type }) {
    const res = await deleteFollow({ data: { id, type } });
    if (res.code === 0 && res.data) {
      return {
        msg: '操作成功',
        data: res.data,
        success: true,
      };
    }
    return {
      msg: res.msg,
      data: null,
      success: false,
    };
  }

  /**
   * 获取用户自己发的主题列表
   * @returns
   */
  @action
  getUserThreads = async () => {
    const userThreadList = await readThreadList({
      params: {
        page: this.userThreadsPage,
        filter: {
          toUserId: 0,
          complex: 5,
        },
      },
    });
    if (userThreadList.code !== 0) {
      throw {
        Code: userThreadList.code,
        Msg: userThreadList.msg || '获取用户主题列表失败',
      };
    }

    return userThreadList;
  };

  /**
   * 删除指定 id 的用户帖子
   * @param {*} id
   */
  @action
  deleteUserThreads = (id) => {
    Object.keys(this.userThreads).forEach((pageNum) => {
      const pageDataSet = this.userThreads[pageNum];

      const itemIdx = pageDataSet.findIndex(item => item.threadId === id);

      if (itemIdx === -1) return;

      pageDataSet.splice(itemIdx, 1);

      // 计数减少
      this.userThreadsTotalCount -= 1;

      this.userThreads[pageNum] = [...pageDataSet];
    });
  };

  // 获取用户主题列表的写方法
  // 读写分离，用于阻止多次请求的数据错乱
  setUserThreads = async (userThreadList) => {
    const pageData = get(userThreadList, 'data.pageData', []);
    const totalPage = get(userThreadList, 'data.totalPage', 1);
    const currPage = get(userThreadList, 'data.currentPage', 1);

    this.userThreadsTotalPage = totalPage;

    this.userThreads = {
      ...this.userThreads,
      [currPage]: pageData,
    };

    this.userThreadsTotalCount = get(userThreadList, 'data.totalCount', 0);

    if (this.userThreadsPage <= this.userThreadsTotalPage) {
      this.userThreadsPage += 1;
    }
  };

  /**
   * 获取指定用户发的主题列表
   * @param {*} id
   * @returns
   */
  @action
  async getTargetUserThreads(id) {
    const targetUserThreadList = await readThreadList({
      params: {
        page: this.targetUserThreadsPage,
        filter: {
          toUserId: id,
          complex: 5,
        },
      },
    });

    const pageData = get(targetUserThreadList, 'data.pageData', []);
    const totalPage = get(targetUserThreadList, 'data.totalPage', 1);
    this.targetUserThreadsTotalPage = totalPage;
    this.targetUserThreads = {
      ...this.targetUserThreads,
      [this.targetUserThreadsPage]: pageData,
    };
    this.targetUserThreadsTotalCount = get(targetUserThreadList, 'data.totalCount', 0);

    if (this.targetUserThreadsPage <= this.targetUserThreadsTotalPage) {
      this.targetUserThreadsPage += 1;
    }

    return this.targetUserThreads;
  }

  /**
   * 上传新的头像
   */
  @action
  async updateAvatar(file) {
    if (!file) return;
    const param = new FormData();
    param.append('avatar', file); // 通过append向form对象添加数据
    param.append('pid', this.id);

    const updateAvatarRes = await updateAvatar({
      transformRequest: [
        function (data) {
          return data;
        },
      ],
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: param,
    });

    if (updateAvatarRes.code === 0) {
      this.userInfo.avatarUrl = updateAvatarRes.data.avatarUrl;
      this.userInfo = { ...this.userInfo };
      this.updateUserThreadsAvatar(updateAvatarRes.data.avatarUrl);
      return updateAvatarRes.data;
    }

    throw {
      Code: updateAvatarRes.code,
      Msg: updateAvatarRes.msg,
    };
  }

  // 更新头像后，更新用户 threads 列表的 avatar url
  @action
  updateUserThreadsAvatar(avatarUrl) {
    Object.keys(this.userThreads).forEach((key) => {
      this.userThreads[key].forEach((thread) => {
        if (!thread.user) {
          thread.user = {};
        }
        thread.user.avatar = avatarUrl;
      });
    });
  }

  /**
   * 上传新的背景图
   */
  @action
  async updateBackground(file) {
    if (!file) return;
    const param = new FormData();
    param.append('background', file); // 通过append向form对象添加数据
    const updateBackgroundRes = await updateBackground({
      transformRequest: [
        function (data) {
          return data;
        },
      ],
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: param,
    });

    this.userInfo.backgroundUrl = '';

    if (updateBackgroundRes.code === 0) {
      // 因为背景图 url 是一致的，所以会导致不更新，这里进行先赋予空值，再延时赋值
      setTimeout(() => {
        this.userInfo.backgroundUrl = updateBackgroundRes.data.backgroundUrl;
        this.userInfo = { ...this.userInfo };
      }, 500);
      return updateBackgroundRes.data;
    }

    throw {
      Code: updateBackgroundRes.code,
      Msg: updateBackgroundRes.msg,
    };
  }

  // FIXME: 这里报接口参数错误
  /**
   * 更新新的用户信息
   */
  @action
  async updateEditedUserInfo() {
    const updateUserInfoRes = await updateUsersUpdate({
      data: {
        signature: this.editSignature,
        nickname: this.editNickName,
      },
    });

    if (updateUserInfoRes.code === 0) {
      this.userInfo.signature = this.editSignature;
      // 用户名不能为空
      if (this.editNickName) {
        this.userInfo.nickname = this.editNickName;
      }
      return updateUserInfoRes.data;
    }

    throw {
      Code: updateUserInfoRes.code,
      Message: updateUserInfoRes.msg,
    };
  }

  @action
  async updateEditedUserNickname() {
    const updateUserInfoRes = await updateUsersUpdate({
      data: {
        nickname: this.editNickName,
      },
    });

    if (updateUserInfoRes.code === 0) {
      this.userInfo.nickname = this.editNickName;
      return updateUserInfoRes.data;
    }

    throw {
      Code: updateUserInfoRes.code,
      Message: updateUserInfoRes.msg,
    };
  }

  @action
  async updateEditedUserSignature() {
    const updateUserInfoRes = await updateUsersUpdate({
      data: {
        signature: this.editSignature,
      },
    });

    if (updateUserInfoRes.code === 0) {
      this.userInfo.signature = get(updateUserInfoRes, 'data.signature');
      return updateUserInfoRes.data;
    }

    throw {
      Code: updateUserInfoRes.code,
      Message: updateUserInfoRes.msg,
    };
  }

  /**
   * 初次设置用户密码
   */
  @action
  async setUserPassword() {
    const setUserPasswordRes = await updateUsersUpdate({
      data: {
        newPassword: this.newPassword,
        passwordConfirmation: this.newPasswordRepeat,
      },
    });

    if (setUserPasswordRes.code === 0) {
      return setUserPasswordRes.data;
    }

    throw {
      Code: setUserPasswordRes.code,
      Message: setUserPasswordRes.msg,
    };
  }

  @action
  async updateUsername() {
    const updateUserInfoRes = await updateUsersUpdate({
      data: {
        username: this.editUserName,
      },
    });

    if (updateUserInfoRes.code === 0) {
      this.userInfo.username = this.editUserName;
      return updateUserInfoRes.data;
    }

    throw {
      Code: updateUserInfoRes.code,
      Msg: updateUserInfoRes.msg,
    };
  }

  /**
   * 重设用户密码
   */
  @action
  async resetUserPassword() {
    const resetUserPasswordRes = await updateUsersUpdate({
      data: {
        password: this.oldPassword,
        newPassword: this.newPassword,
        passwordConfirmation: this.newPasswordRepeat,
      },
    });

    if (resetUserPasswordRes.code === 0) {
      return resetUserPasswordRes.data;
    }

    throw {
      Code: resetUserPasswordRes.code,
      Message: resetUserPasswordRes.msg,
    };
  }

  @action
  async sendSmsUpdateCode({ mobile, captchaTicket, captchaRandStr }) {
    const smsResp = await smsSend({
      data: {
        mobile,
        type: 'rebind',
        captchaTicket,
        captchaRandStr,
      },
    });

    if (smsResp.code === 0) {
      // 可以利用 interval 获取过期时间
      return smsResp.data;
    }

    throw {
      Code: smsResp.code,
      Message: smsResp.msg,
    };
  }

  @action
  async sendSmsVerifyCode({ mobile, captchaTicket, captchaRandStr }) {
    const smsResp = await smsSend({
      data: {
        mobile,
        type: 'verify',
        captchaTicket,
        captchaRandStr,
      },
    });

    if (smsResp.code === 0) {
      // 可以利用 interval 获取过期时间
      return smsResp.data;
    }

    throw {
      Code: smsResp.code,
      Message: smsResp.msg,
    };
  }

  @action
  async verifyOldMobile() {
    const smsVerifyRes = await smsVerify({
      data: {
        mobile: this.originalMobile,
        code: this.oldMobileVerifyCode,
      },
    });

    if (smsVerifyRes.code === 0) {
      return smsVerifyRes.data;
    }

    throw {
      Code: smsVerifyRes.code,
      Message: smsVerifyRes.msg,
    };
  }

  @action
  async rebindMobile() {
    const smsRebindRes = await smsRebind({
      data: {
        mobile: this.newMobile,
        code: this.newMobileVerifyCode,
      },
    });

    if (smsRebindRes.code === 0) {
      return smsRebindRes.data;
    }

    throw {
      Code: smsRebindRes.code,
      Message: smsRebindRes.msg,
    };
  }

  @action
  async getUserLikes(page = 1) {
    const userLikesList = await readThreadList({
      params: {
        page,
        filter: {
          complex: 2,
        },
      },
    });

    return userLikesList;
  }

  @action
  async getUserCollections(page = 1) {
    const userCollectionList = await readThreadList({
      params: {
        page,
        filter: {
          complex: 2,
        },
      },
    });

    return userCollectionList;
  }

  /**
   * 我的屏蔽对应store函数
   */

  // 获取屏蔽列表数据
  @action
  async getUserShieldList() {
    const userShieldList = await readUsersDeny({
      params: {
        page: this.userShieldPage, // 页码
      },
    });
    const pageData = get(userShieldList, 'data.pageData', []);
    const totalPage = get(userShieldList, 'data.totalPage', 1);
    this.userShieldTotalPage = totalPage;
    this.userShield = [...this.userShield, ...pageData];
    this.userShieldTotalCount = get(userShieldList, 'data.totalCount', 0);

    if (this.userShieldPage <= this.userShieldTotalPage) {
      this.userShieldPage += 1;
    }

    if (userShieldList.code !== 0) {
      throw {
        Code: userShieldList.code,
        Message: userShieldList.msg,
      };
    }
    return this.userShield;
  }

  /**
   * 重置帖子相关的数据
   */
  @action
  clearUserThreadsInfo() {
    this.userThreads = {};
    this.userThreadsPage = 1;
    this.userThreadsTotalCount = 0;
    this.userThreadsTotalPage = 1;
  }

  /**
   * 清理对应用户密码函数
   */
  @action
  clearUserAccountPassword = () => {
    this.oldPassword = null;
    this.newPassword = null;
    this.newPasswordRepeat = null;
  };

  /**
   * 四个清理函数，清理用户和目标用户粉丝信息
   */
  @action
  cleanUserFans = () => {
    this.userFans = {};
    this.userFansPage = 1;
    this.userFansTotalPage = 1;
  };

  @action
  cleanUserFollows = () => {
    this.userFollows = {};
    this.userFollowsPage = 1;
    this.userFollowsTotalPage = 1;
  };

  @action
  cleanTargetUserThreads = () => {
    this.targetUserThreads = [];
    this.targetUserThreadsPage = 1;
    this.targetUserThreadsTotalCount = 0;
    this.targetUserThreadsTotalPage = 1;
  };

  @action
  cleanTargetUserFans = () => {
    this.targetUserFans = {};
    this.targetUserFansPage = 1;
    this.targetUserFansTotalPage = 1;
  };

  @action
  cleanTargetUserFollows = () => {
    this.targetUserFollows = {};
    this.targetUserFollowsPage = 1;
    this.targetUserFollowsTotalPage = 1;
  };

  /**
   * 清理我的屏蔽数据内容
   */
  @action
  clearUserShield = () => {
    // 我的屏蔽 数据设计
    this.userShield = []; // 用户屏蔽列表
    // 触底加载条件 当加载的页数超过总页数的时候就没有更多了
    this.userShieldPage = 1; // 页码
    this.userShieldTotalPage = 1; // 总页数
    this.userShieldTotalCount = 0; // 总条数
  };

  /**
   * 清理他人用户数据函数
   */
  @action
  removeTargetUserInfo = () => {
    this.targetUser = null;
    this.cleanTargetUserThreads();
    this.cleanTargetUserFans();
    this.cleanTargetUserFollows();
  };

  /**
   * 支付成功后，更新帖子列表指定帖子状态
   * @param {number} threadId 帖子id
   * @param {object}  obj 更新数据
   * @returns
   */
  @action
  updatePayThreadInfo(threadId, obj) {
    const targetThreads = this.findAssignThread(threadId);
    if (!targetThreads || targetThreads.length === 0) return;

    targetThreads.forEach((targetThread) => {
      const { index, key, data, store } = targetThread;
      if (store[key] && store[key][index]) {
        store[key][index] = obj;
      }
    });
  }

  /**
   * 更新帖子列表指定帖子状态
   * @param {number} threadId 帖子id
   * @param {object}  obj 更新数据
   * @param {boolean} obj.isLike 是否更新点赞
   * @param {boolean} obj.isPost 是否更新评论数
   * @param {boolean} obj.user 当前操作的用户
   * @returns
   */
  @action
  updateAssignThreadInfo(threadId, obj = {}) {
    const targetThreads = this.findAssignThread(threadId);

    if (!targetThreads || targetThreads.length === 0) return;

    targetThreads.forEach((targetThread) => {
      if (!targetThread) return;

      const { index, key, data, store } = targetThread; // 这里是数组
      const { updateType, updatedInfo, user } = obj;

      if (!data && !data?.likeReward && !data?.likeReward?.users) return;

      // 更新点赞
      if (
        updateType === 'like'
        && !typeofFn.isUndefined(updatedInfo.isLiked)
        && !typeofFn.isNull(updatedInfo.isLiked)
        && user
      ) {
        const { isLiked, likePayCount = 0 } = updatedInfo;
        const theUserId = user.userId || user.id;
        data.isLike = isLiked;

        const userData = threadReducer.createUpdateLikeUsersData(user, 1);
        // 添加当前用户到按过赞的用户列表
        const newLikeUsers = threadReducer.setThreadDetailLikedUsers(data.likeReward, !!isLiked, userData);

        data.likeReward.users = newLikeUsers;
        data.likeReward.likePayCount = likePayCount;
      }

      // 更新评论
      if (updateType === 'comment' && data?.likeReward) {
        data.likeReward.postCount = data.likeReward.postCount + 1;
      }

      // 更新分享
      if (updateType === 'share') {
        data.likeReward.shareCount = data.likeReward.shareCount + 1;
      }

      if (store[key] && store[key][index]) {
        store[key][index] = data;
      }
    });
  }

  // 获取指定的帖子数据
  findAssignThread(threadId) {
    const threadArr = [];

    if (this.userThreads) {
      const keys = Object.keys(this.userThreads);
      keys.forEach((item) => {
        const pageData = this.userThreads[item];

        for (let i = 0; i < pageData.length; i++) {
          if (pageData[i].threadId === threadId) {
            threadArr.push({ key: item, index: i, data: pageData[i], store: this.userThreads });
          }
        }
      });
    }

    if (this.targetUserThreads) {
      const keys = Object.keys(this.targetUserThreads);
      keys.forEach((item) => {
        const pageData = this.targetUserThreads[item];

        for (let i = 0; i < pageData.length; i++) {
          if (pageData[i].threadId === threadId) {
            threadArr.push({ key: item, index: i, data: pageData[i], store: this.targetUserThreads });
          }
        }
      });
    }

    return threadArr;
  }

  // 生成微信换绑二维码，仅在 PC 使用
  @action
  genRebindQrCode = async ({ scanSuccess = () => {}, scanFail = () => {}, onTimeOut = () => {}, option = {} }) => {
    clearInterval(this.rebindTimer);
    this.isQrCodeValid = true;
    const qrCodeRes = await wechatRebindQrCodeGen(option);

    if (qrCodeRes.code === 0) {
      this.rebindQRCode = get(qrCodeRes, 'data.base64Img');
      const sessionToken = get(qrCodeRes, 'data.sessionToken');

      this.rebindTimer = setInterval(() => {
        this.wechatRebindStatusPoll({
          sessionToken,
          scanSuccess,
          scanFail,
        });
      }, 2000);

      // 5min，二维码失效
      setTimeout(() => {
        this.isQrCodeValid = false;
        clearInterval(this.rebindTimer);
        if (onTimeOut) {
          onTimeOut();
        }
      }, 4 * 60 * 1000);

      return qrCodeRes.data;
    }

    throw {
      Code: qrCodeRes.code,
      Msg: qrCodeRes.msg,
    };
  };

  // mini 换绑接口
  @action
  rebindWechatMini = async ({ jsCode, iv, encryptedData, sessionToken }) => {
    try {
      const miniRebindResp = await miniRebind({
        data: {
          jsCode,
          iv,
          encryptedData,
          sessionToken,
        },
      });

      if (miniRebindResp.code === 0) {
        return miniRebindResp;
      }

      // 不为零，实际是错误
      throw miniRebindResp;
    } catch (err) {
      if (err.code) {
        throw {
          Code: err.code,
          Msg: err.msg,
        };
      }

      throw {
        Code: 'rbd_9999',
        Msg: '网络错误',
        err,
      };
    }
  };

  // h5 换绑接口
  @action
  rebindWechatH5 = async ({ code, sessionId, sessionToken, state }) => {
    try {
      const h5RebindResp = await h5Rebind({
        params: {
          code,
          sessionId,
          sessionToken,
          state,
        },
      });

      if (h5RebindResp.code === 0) {
        return h5RebindResp;
      }

      // 不为零，实际是错误
      throw h5RebindResp;
    } catch (err) {
      if (err.code) {
        throw {
          Code: err.code,
          Msg: err.msg,
        };
      }

      throw {
        Code: 'rbd_9999',
        Msg: '网络错误',
        err,
      };
    }
  };

  // 轮询重新绑定结果
  @action
  wechatRebindStatusPoll = async ({ sessionToken, scanSuccess, scanFail }) => {
    const scanStatus = await getWechatRebindStatus({
      params: {
        sessionToken,
      },
    });

    if (scanStatus.code === 0) {
      if (scanSuccess) {
        scanSuccess();
      }
    }

    if (scanStatus.code !== 0) {
      if (scanStatus.msg !== '扫码中') {
        if (scanFail) {
          scanFail(scanStatus);
        }
      }
    }
  };

  // 获取用户注册扩展信息
  @action
  getUserSigninFields = async () => {
    let signinFieldsResp = {
      code: 0,
      data: [],
    };

    const safeParse = (value) => {
      try {
        return JSON.parse(value);
      } catch (e) {
        console.error(e);
        console.error('解析JSON错误', value);
        return value;
      }
    };

    try {
      signinFieldsResp = await getSignInFields();
    } catch (e) {
      console.error(e);
      throw {
        Code: 'usr_9999',
        Message: '网络错误',
      };
    }
    if (signinFieldsResp.code === 0) {
      this.userSigninFields = signinFieldsResp.data.map((item) => {
        if (!item.fieldsExt) {
          item.fieldsExt = '';
        } else {
          item.fieldsExt = safeParse(item.fieldsExt);
        }
        return item;
      });
    } else {
      throw {
        Code: signinFieldsResp.code,
        Message: signinFieldsResp.msg,
      };
    }
  };

  // 清空换绑二维码和interval
  @action
  clearWechatRebindTimer = () => {
    clearInterval(this.rebindTimer);
    this.rebindQRCode = null;
    this.isQrCodeValid = true;
  };
}

export default UserAction;
