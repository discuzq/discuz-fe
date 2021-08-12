import { action, computed } from 'mobx';
import SearchStore from './store';
import { readTopicsList, readUsersList, readThreadList, createFollow, deleteFollow } from '../../server';
import typeofFn from '@common/utils/typeof';
import threadReducer from '../thread/reducer';

class SearchAction extends SearchStore {
  constructor(props) {
    super(props);
  }

  @action
  setIndexTopics(data) {
    this.indexTopics = data;
  }

  @action
  setIndexUsers(data) {
    this.indexUsers = data;
  }

  @action
  setIndexThreads(data) {
    this.indexThreads = data;
  }

  @action
  setTopics(data) {
    this.topics = data;
  }

  @action
  setUsers(data) {
    this.users = data;
  }

  @action
  setThreads(data) {
    this.threads = data;
  }

  @action
  setSearchTopics(data) {
    this.searchTopics = data;
  }

  @action
  setSearchUsers(data) {
    this.searchUsers = data;
  }

  @action
  setSearchThreads(data) {
    this.searchThreads = data;
  }

  // 获取数据状态 - 仅用于PC端
  @computed get dataIndexStatus() {
    const { indexTopics, indexUsers, indexThreads } = this;
    const { pageData: topicsPageData } = indexTopics || {};
    const { pageData: usersPageData } = indexUsers || {};
    const { pageData: threadsPageData } = indexThreads || {};

    const hasTopics = !!(topicsPageData?.length)
    const hasUsers = !!(usersPageData?.length)
    const hasThreads = !!(threadsPageData?.length)

    // 都有值，则显示全部
    const isShowAll = hasTopics && hasUsers && hasThreads

    // 都没值
    const isNoData = !hasTopics && !hasUsers && !hasThreads

    return { hasTopics, hasUsers, hasThreads, isShowAll, isNoData }
  }

  // 获取数据状态 - 用于小程序和H5
  @computed get dataSearchStatus() {
    const { searchTopics, searchUsers, searchThreads } = this;
    const { pageData: topicsPageData } = searchTopics || {};
    const { pageData: usersPageData } = searchUsers || {};
    const { pageData: threadsPageData } = searchThreads || {};

    const hasTopics = !!(topicsPageData?.length)
    const hasUsers = !!(usersPageData?.length)
    const hasThreads = !!(threadsPageData?.length)

    // 都没有值，或者都有值，则显示全部
    const isShowAll = (!hasTopics && !hasUsers && !hasThreads) || (hasTopics && hasUsers && hasThreads)

    return { hasTopics, hasUsers, hasThreads, isShowAll }
  }

  /**
   * 发现模块 - 重置首页数据
   */
  @action
  resetIndexData() {
    this.indexTopicsError = { isError: false, errorText: '' }
    this.indexUsersError = { isError: false, errorText: '' }
    this.indexThreadsError = { isError: false, errorText: '' }

    this.currentKeyword = null // 当前正在搜索的关键词重置

    this.searchNoData = false // 搜索页没有搜索到东西，从首页返回搜索页要重置

    this.setIndexTopics(null)
    this.setIndexUsers(null)
    this.setIndexThreads(null)
  }

  /**
   * 发现模块 - 重置搜索结果页数据
   */
   @action
   resetSearchData() {
     this.searchTopicsError = { isError: false, errorText: '' }
     this.searchUsersError = { isError: false, errorText: '' }
     this.searchThreadsError = { isError: false, errorText: '' }

     this.setSearchTopics(null)
     this.setSearchUsers(null)
     this.setSearchThreads(null)
   }

  /**
   * 发现模块 - 首页数据
   * @param {object} search * 搜索值
   * @param {number} type * 0: 发现页发起请求 1：发现搜索结果页发起请求
   * @returns {object} 处理结果
   */
  @action
  async getSearchData({
    type = 0,
    search,
    perPage = 10,
    hasTopics = false,
    hasUsers = false,
    hasThreads = false,
  } = {}) {
    let newPerPage = perPage;
    const topicFilter = {
      hot: search ? 0 : 1,
      content: search,
    };

    // type = 1,搜索结果
    if (type === 1) {
      newPerPage = 3;
      topicFilter.hot = 0;
    }

    let tasks = []
    if ( !hasTopics ) {
      tasks.push(readTopicsList({ params: { filter: topicFilter, perPage: newPerPage, page: 1 } }))
    } else {
      tasks.push(Promise.resolve({}))
    }

    if ( !hasUsers ) {
      tasks.push(readUsersList({ params: { filter: { hot: 1, nickname: search }, perPage: newPerPage, page: 1 } }))
    } else {
      tasks.push(Promise.resolve({}))
    }

    if ( !hasThreads ) {
      tasks.push(readThreadList({ params: { filter: { search }, perPage: newPerPage, page: 1, scope: '2' } }))
    } else {
      tasks.push(Promise.resolve({}))
    }

    const result = await Promise.all(tasks)

    if ( !hasTopics ) {
      const res = result[0]
       
      const { code, data, msg } = res;
      if (code !== 0) {
        if (type === 0) {
          this.indexTopicsError = { isError: true, errorText: msg || '加载失败' }
        } else {
          this.searchTopicsError = { isError: true, errorText: msg || '加载失败' }
        }
      }
      
      type === 0 ? this.setIndexTopics(code === 0 ? data : {}) : this.setSearchTopics(code === 0 ? data : {});
    }

    if ( !hasUsers ) {
      const res = result[1]
       
      const { code, data, msg } = res;
      if (code !== 0) {
        if (type === 0) {
          this.indexUsersError = { isError: true, errorText: msg || '加载失败' }
        } else {
          this.searchUsersError = { isError: true, errorText: msg || '加载失败' }
        }
      }

      type === 0 ? this.setIndexUsers(code === 0 ? data : {}) : this.setSearchUsers(code === 0 ? data : {});
    }

    if ( !hasThreads ) {
      const res = result[2]
        
      const { code, data, msg } = res;
      if (code !== 0) {
        if (type === 0) {
          this.indexThreadsError = { isError: true, errorText: msg || '加载失败' }
        } else {
          this.searchThreadsError = { isError: true, errorText: msg || '加载失败' }
        }
      }

      type === 0 ? this.setIndexThreads(code === 0 ? data : {}) : this.setSearchThreads(code === 0 ? data : {});
    }
  };

  /**
   * 发现模块 - 更多话题
   * @param {object} search * 搜索值
   * @returns {object} 处理结果
   */
  @action
  async getTopicsList({ search = '', hot = 0, perPage = 10, page = 1 } = {}) {
    const topicFilter = {
      hot: hot,
      content: search,
    };
    const result = await readTopicsList({ params: { filter: topicFilter, perPage, page } });

    if (result.code === 0 && result.data) {
      if (this.topics && result.data.pageData && page !== 1) {
        this.topics.pageData.push(...result.data.pageData);
        const newPageData = this.topics.pageData.slice();
        this.setTopics({ ...result.data, pageData: newPageData });
      } else {
        this.setTopics(result.data);
      }
      return result.data;
    } else {
      this.topicsError = { isError: true, errorText: result?.msg || '加载失败' }
    }
  };

  /**
   * 发现模块 - 更多用户
   * @param {object} search * 搜索值
   * @param {string} type 搜索类型 username-按用户名，nickname按昵称搜索
   * @returns {object} 处理结果
   */
  @action.bound
  async getUsersList({ type = 'nickname', search = '', hot = 0, perPage = 10, page = 1  } = {}) {
    const result = await readUsersList({ params: { filter: { hot, [type]: search }, perPage, page } });
    const {code, data} = result;
    if (code === 0 && data) {
      if (this.users && data.pageData && page !== 1) {
        this.users.pageData.push(...data.pageData);
        const newPageData = this.users.pageData.slice();
        this.setUsers({ ...data, pageData: newPageData });
      } else {
        this.setUsers(data);
      }
      return result;
    } else {
      this.usersError = { isError: true, errorText: result?.msg || '加载失败' }
    }
  };

  /**
 * 发现模块 - 更多内容
 * @param {object} search * 搜索值
 * @returns {object} 处理结果
 */
 @action
  async getThreadList({ scope = 0, sort = '3', search = '', perPage = 10, page = 1, params = {} } = {}) {
    const result = await readThreadList({ params: { filter: { search }, scope, perPage, page, ...params } });

    if (result.code === 0 && result.data) {
      if (this.threads && result.data.pageData && page !== 1) {
        this.threads.pageData.push(...result.data.pageData);
        const newPageData = this.threads.pageData.slice();
        this.setThreads({ ...result.data, pageData: newPageData });
      } else {
        // 首次加载，先置空，是为了列表回到顶部
        this.setThreads({ pageData: [] });
        this.setThreads(result.data);
      }
      return result.data;
    } else {
      this.threadsError = { isError: true, errorText: result?.msg || '加载失败' }

      return Promise.reject(result?.msg || '加载失败');
    }
  };

/**
 * 发现模块 - 关注
 * @param {object} search * 搜索值
 * @returns {object} 处理结果
 */
 @action
 async postFollow(userId) {
   const result = await createFollow({ data: { toUserId: userId } });
   if (result.code === 0 && result.data) {
     return result.data;
   }

   return Promise.reject(result?.msg || '接口请求失败');
 };

 /**
 * 发现模块 - 取消关注
 * @param {object} search * 搜索值
 * @returns {object} 处理结果
 */
  @action
  async cancelFollow({ id, type }) {
    const result = await deleteFollow({ data: { id, type: type } });
    if (result.code === 0 && result.data) {
      return result.data;
    }
    return null;
  };

   /**
   * 删除帖子操作
   * @param {string} id 帖子id
   * @returns
   */
    @action
    async deleteThreadsData({ id } = {}) {
      if (!id) {
        return
      }
 
      if (this.threads) {
       const { pageData = [] } = this.threads;
       const newPageData = pageData.filter(item => item.threadId !== id)
 
       if (this.threads?.pageData) {
         this.threads.pageData = newPageData;
       }
     }
 
     if (this.indexThreads) {
       const { pageData = [] } = this.indexThreads;
       const newPageData = pageData.filter(item => item.threadId !== id)
 
       if (this.indexThreads?.pageData) {
         this.indexThreads.pageData = newPageData;
       }
     }
    }

  /**
   * 更新用户状态
   * @param {number} userId 用户id
   * @param {object}  obj 更新数据
   * @param {boolean} obj.isFollow 是否更新点赞
   * @returns
   */
   @action
   updateActiveUserInfo(userId, obj = {}) {
    const users = this.findAssignUser(userId)

    users?.forEach(item => {
      this.updateInfo(item, obj)
    })
   }

   @action
  updateInfo(dataSource, obj) {
    if (!dataSource) {
      return
    }
    const { index, data, store } = dataSource;

    // 更新点赞
    const { isFollow } = obj;
    if (!typeofFn.isUndefined(isFollow) && !typeofFn.isNull(isFollow)) {
      data.isFollow = isFollow;
    }

    // 更新点赞
    const { isMutual } = obj;
    if (!typeofFn.isUndefined(isMutual) && !typeofFn.isNull(isMutual)) {
      data.isMutualFollow = isMutual;
    }

    if (store?.pageData) {
      const newArr = store.pageData.slice()
      newArr[index] = data;
      store.pageData = newArr
    }
  }

   // 获取指定的用户数据
  findAssignUser(userId) {
    const users = []
    if (this.indexUsers) {
      const { pageData = [] } = this.indexUsers;
      pageData.forEach((item, index) => {
        if (item.userId === userId) {
          users.push(
            { index, data: item, store: this.indexUsers}
          )
        }
      })
    }

    if (this.users) {
      const { pageData = [] } = this.users;
      pageData.forEach((item, index) => {
        if (item.userId === userId) {
          users.push(
            { index, data: item, store: this.users }
          )
        }
      })
    }
    return users
  }

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

     targetThreads.forEach(targetThread => {
      const { index, store } = targetThread;
      if (store?.pageData) {
        store.pageData[index] = obj;
      }
     })
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

      targetThreads.forEach(targetThread => {
        if (!targetThread) return;

        const { index, data, store } = targetThread; // 这里是数组
        const { updateType, updatedInfo, user } = obj;

        if(!data && !data?.likeReward && !data?.likeReward?.users) return;
  
        // 更新点赞
        if (updateType === 'like' && !typeofFn.isUndefined(updatedInfo.isLiked) &&
            !typeofFn.isNull(updatedInfo.isLiked) && user) {
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

        // 更新帖子浏览量
        if (updateType === 'viewCount') {
          data.viewCount = updatedInfo.viewCount;
        }

        if (store.pageData) {
          store.pageData[index] = data;
        }
      });


    }

   // 获取指定的帖子数据
  findAssignThread(threadId) {
    const threadArr = []
    if (this.threads) {
      const { pageData = [] } = this.threads;
      for (let i = 0; i < pageData.length; i++)  {
        if (pageData[i].threadId === threadId) {
          threadArr.push({ index: i, data: pageData[i], store: this.threads });
        }
      }
    }

    if (this.indexThreads) {
      const { pageData = [] } = this.indexThreads;
      for (let i = 0; i < pageData.length; i++)  {
        if (pageData[i].threadId === threadId) {
          threadArr.push({ index: i, data: pageData[i], store: this.indexThreads });
        }
      }
    }

    if (this.searchThreads) {
      const { pageData = [] } = this.searchThreads;
      for (let i = 0; i < pageData.length; i++)  {
        if (pageData[i].threadId === threadId) {
          threadArr.push({ index: i, data: pageData[i], store: this.searchThreads });
        }
      }
    }

    return threadArr
  }
}

export default SearchAction;
