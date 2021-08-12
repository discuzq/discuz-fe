import { action, computed } from 'mobx';
import IndexStore from './store';
import { readCategories, readStickList, readThreadList, updatePosts, createThreadShare, readRecommends } from '@server';
import typeofFn from '@common/utils/typeof';
import threadReducer from '../thread/reducer';
import { getCategoryName, getActiveId, getCategories, handleString2Arr } from '@common/utils/handleCategory'
import replaceStringInRegex from '../../utils/replace-string-in-regex'

class IndexAction extends IndexStore {
  constructor(props) {
    super(props);
  }

  // 获取被点击分类的name
  @computed get categoryName() {
    const categories = this.categories || [];
    const { categoryids } = this.filter

    return getCategoryName(categories, categoryids)
  }

  // 获取被点击一级分类的name
  @computed get activeCategoryId() {
    const categories = this.categories || [];
    const { categoryids } = this.filter

    const [id, cid] = getActiveId(categories, categoryids)
    return id
  }

  // 获取被点击二级分类的name
  @computed get activeChildCategoryId() {
    const categories = this.categories || [];
    const { categoryids } = this.filter

    const [id, cid] = getActiveId(categories, categoryids)
    return cid
  }

  // 获取当前分类数据
  @computed get currentCategories() {
    const categories = this.categories || [];
    const needDefault = this.needDefault

    return getCategories(categories, needDefault)
  }

  /**
   * 发帖时是否需要添加帖子到首页数据中
   * @param {number|string} cid 发帖时选中的种类id
   * @returns {boolean}
   */
  @action
  isNeedAddThread(cid) {
    const { categoryids = [] } = this.filter || {};
    return this.isCurrentAllCategory || categoryids.indexOf(cid) !== -1;
  }

  /**
   * 设置过滤项
   */
  @action
  setFilter(data) {
    this.filter = data
  }

  /**
   * 设置tabBar隐藏or显示
   */
  @action
  setHiddenTabBar(data) {
    this.hiddenTabBar = data
  }

  @action
  setHasOnScrollToLower(data) {
    this.hasOnScrollToLower = data
  }

  @action.bound
  setNeedDefault(data) {
    this.needDefault = data
  }

  @action
  resetErrorInfo() {
    this.threadError = {
      isError: false,
      errorText: ''
    }
    this.categoryError = {
      isError: false,
      errorText: ''
    }
  }

  @action
  resetHomeThreadData() {
    this.threads = null;
    this.sticks = null;
    this.resetErrorInfo()
  }

  /**
   * 详情页点击标签、置顶跳转首页操作
   * @param {array} categoryIds 分类Ids
   * @returns
   */
  @action
  async refreshHomeData({ categoryIds = [] } = {}) {
    if (categoryIds?.length) {
      this.threads = null;
      this.sticks = null;
      this.resetErrorInfo()

      this.setFilter({ categoryids: categoryIds })
    } else {
      const { sequence = 0 } = this.filter
      const categoryids = handleString2Arr(this.filter, 'categoryids')

      this.screenData({ filter: { categoryids }, sequence })
    }
  }

  /**
   * 详情页点击标签跳转首页操作
   * @param {array} categoryIds 分类Ids
   * @returns
   */
  @action
  async deleteThreadsData({ id } = {}, SiteStore) {
    if (id && this.threads) {
      //  删除列表
      const { pageData = [] } = this.threads;
      const newPageData = pageData.filter(item => `${item.threadId}` !== `${id}`)

      if (this.threads?.pageData) {
        this.threads.pageData = newPageData;
        this.changeInfo = { type: 'delete', thread: id }
      }

      // 删除置顶
      const newSticksData = this.sticks?.filter(item => `${item.threadId}` !== `${id}`)

      if (this.sticks) {
        this.sticks = newSticksData;
      }

      if (this.threads?.pageData || this.sticks) {
        // 更新帖子总数
        const totalCount = Number(this.threads.totalCount)
        this.threads.totalCount = totalCount - 1
      }

      // 删除帖子后更新首页导航栏分类数据
      this.getReadCategories();
      SiteStore?.getSiteInfo && SiteStore.getSiteInfo(); // 删除帖子后分类中"全部"数据更新
    }
  }

  /**
   * 触发筛选数据
   * @param {*} param0
   */
  @action
  async screenData({ filter = {}, sequence = 0, perPage = 10, page = 1, isMini = false } = {}) {
    // 如果是小程序请求，先不把数据置空，以免导致页面提前渲染
    if (!isMini) {
      this.threads = null;
      this.sticks = null;
    }

    this.resetErrorInfo()

    await this.getRreadStickList(filter.categoryids);
    await this.getReadThreadList({ filter, sequence, perPage, page });

    return
  }

  /**
   * 获取帖子数据
   * @returns
   */
  @action
  async getReadThreadList({ filter = {}, sequence = 0, perPage = 10, page = 1, isDraft = false } = {}) {
    // 过滤空字符串
    const newFilter = filter;
    if (filter.categoryids && (filter.categoryids instanceof Array)) {
      const newCategoryIds = filter.categoryids?.filter(item => item);
      if (!newCategoryIds.length) {
        delete newFilter.categoryids;
      }
    }
    this.latestReq += 1;
    const currentReq = this.latestReq;
    const result = await readThreadList({ params: { perPage, page, filter: newFilter, sequence } });
    if (currentReq !== this.latestReq) {
      return;
    }
    if (result.code === 0 && result.data) {
      if (isDraft) {
        if (this.drafts && result.data.pageData && page !== 1) {
          this.drafts.pageData.push(...result.data.pageData);
          const newPageData = this.drafts.pageData.slice();
          this.setDrafts({
            ...result.data,
            currentPage: result.data.currentPage,
            pageData: newPageData,
          });
        } else {
          // 首次加载
          // this.drafts = null;
          this.setDrafts(result.data);
        }
      } else {
        if (this.threads && result.data.pageData && page !== 1) {
          const nextThreads = result.data.pageData.map(item => {
            item.openedMore = false;
            return item
          })

          this.threads.pageData.push(...nextThreads);
          this.threads.currentPage = result.data.currentPage;
        } else {
          // 首次加载
          this.threads = null;
          this.setThreads(this.adapterList(result.data));
        }
      }
      return result.data;
    } else {
      this.threadError = {
        isError: true,
        errorText: result?.msg || ''
      }

      return Promise.reject(result?.msg || '');
    }
  }

  /**
   * 获取分类数据
   * @returns
   */
  @action.bound
  async getReadCategories() {
    const result = await readCategories();
    if (result.code === 0) {
      if (result.data) {
        const data = [...result.data];
        this.setCategories(data);
        return this.categories;
      }
      this.setCategories([]);
      return []
    } else {
      this.categoryError = {
        isError: true,
        errorText: result?.msg || '加载失败'
      }

      return Promise.reject(result?.msg || '加载失败');
    }
  }

  /**
   * 获取置顶数据
   * @returns
   */
  @action
  async getRreadStickList(categoryIds = []) {
    const result = await readStickList({ params: { categoryIds } });
    if (result.code === 0) {
      this.sticks = null;
      this.setSticks(result.data || []);
      return this.sticks;
    }
    return null;
  }

  // 获取指定的帖子数据
  findAssignThread(threadId) {
    if (this.threads) {
      const { pageData = [] } = this.threads;
      for (let i = 0; i < pageData.length; i++) {
        if (pageData[i].threadId === threadId) {
          return { index: i, data: pageData[i] };
        }
      }
      return null;
    }
  }

  // 获取指定的置顶帖子数据
  findAssignSticks(threadId) {
    if (this.sticks) {
      for (let i = 0; i < this.sticks.length; i++) {
        if (this.sticks[i].threadId === threadId) {
          return { index: i, data: this.sticks[i] };
        }
      }
      return null;
    }
  }

  /**
   * 写入分类数据
   * @param {Object} data
   */
  @action.bound
  setCategories(data) {
    this.categories = data;
  }

  /* 写入置顶数据
   * @param {Object} data
   */
  @action
  setSticks(data) {
    this.sticks = data;
  }

  /**
   * 写入帖子数据
   * @param {Object} data
   */
  @action
  setThreads(data) {
    this.threads = data;
  }


  @action
  setDrafts(data) {
    this.drafts = data;
  }

  /**
   * 支付成功后，更新帖子列表指定帖子状态
   * @param {number} threadId 帖子id
   * @param {object}  obj 更新数据
   * @returns
   */
  @action
  updatePayThreadInfo(threadId, obj) {
    const targetThread = this.findAssignThread(threadId);
    if (!targetThread || targetThread.length === 0) return;

    const { index } = targetThread;
    if (this.threads?.pageData) {
      this.threads.pageData[index] = obj;
      this.changeInfo = { type: 'pay', thread: threadId }
    }
  }

  /**
   * 更新帖子所有内容，重新编辑
   * @param {string} threadId
   * @param {object} threadInfo
   * @returns boolean
   */
  @action
  updateAssignThreadAllData(threadId, threadInfo) {
    if (!threadId || !threadInfo || !Object.keys(threadInfo).length) return false;

    // 更新置顶帖
    this.updateAssignSticksInfo(threadId, threadInfo)

    // 更新帖子列表
    const targetThread = this.findAssignThread(typeofFn.isNumber(threadId) ? threadId : +threadId);
    if (!targetThread) return false;
    const { index, data } = targetThread;
    this.threads.pageData[index] = threadInfo;

    this.updateAssignThreadInfoInLists({ threadId: typeofFn.isNumber(threadId) ? threadId : +threadId, threadInfo });

    // 小程序编辑
    this.changeInfo = { type: 'edit', thread: threadInfo }

    return true;
  }

  /**
   * 更新置顶帖内容
   * @param {string} threadId
   * @param {object} threadInfo
   * @returns boolean
   */
  @action
  updateAssignSticksInfo(threadId, threadInfo) {
    const targetThread = this.findAssignSticks(threadId);
    if (!targetThread || targetThread.length === 0) return;

    // TODO 因为置顶贴的数据格式和帖子列表的数据格式不一致，先通过网络请求的方式解决问题
    const categoryids = handleString2Arr(this.filter, 'categoryids')
    this.getRreadStickList(categoryids)

    // const { index, data } = targetThread;

    // const text = threadInfo.title || threadInfo?.content?.text;
    // let newText = replaceStringInRegex(text, "break", '');
    // newText = replaceStringInRegex(newText, "heading", '');
    // newText = replaceStringInRegex(newText, "paragraph", '');
    // newText = replaceStringInRegex(newText, "imgButEmoj", '');
    // newText = replaceStringInRegex(newText, "list", '');
    // this.sticks[index] = { 
    //   canViewPosts: threadInfo?.ability?.canViewPost, 
    //   categoryId: threadInfo?.categoryId, 
    //   title: threadInfo.title || threadInfo?.content?.text, 
    //   updatedAt: threadInfo?.updatedAt,
    //   threadId: threadInfo?.threadId
    // };
  }

  /**
   * 更新帖子列表指定帖子状态
   * @param {number} threadId 帖子id
   * @param {object}  obj 更新数据
   * @returns
   */
  @action
  updateAssignThreadInfo(threadId, obj = {}) {
    const targetThread = this.findAssignThread(threadId);
    const targetThreadsInLists = this.findAssignThreadInLists({ threadId });

    const { updateType, updatedInfo, user, openedMore } = obj;

    const threadUpdater = ({
      data,
      callback = () => {}
    }) => {
      if (!data && !data?.likeReward && !data?.likeReward?.users) return;

      // 更新整个帖子内容
      if (data && updateType === 'content') {
        callback(data);
      }

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
  
      if (updateType === 'openedMore') {
        data.openedMore = openedMore;
      }

      callback(data);
    }

    if (targetThread && targetThread.length !== 0) {
      const { index, data } = targetThread;

      threadUpdater({
        data,
        callback: (updatedInfo) => {
          this.threads.pageData[index] = updatedInfo;
        }
      })
    }

    if (targetThreadsInLists && targetThreadsInLists.length !== 0) {
      targetThreadsInLists.forEach(({ index, page, listName, data }) => {
        threadUpdater({ 
          data,
          callback: (updatedInfo) => {
            this.lists[listName].data[page][index] = updatedInfo;
          }
        })
      })
    }

  }

  /**
   * 添加帖子
   * @param {obj} threadInfo
   */
  @action
  addThread(threadInfo) {
    const { threadId = '' } = threadInfo
    const targetThread = this.findAssignThread(threadId);

    // 如果更新的数据不存在，则直接插入。若存在，则替代原有数据
    if (!targetThread || targetThread.length === 0) {
      const { pageData } = this.threads || {};
      if (pageData) {
        pageData.unshift(threadInfo);
        this.threads.pageData = this.threads.pageData.slice();
        const totalCount = Number(this.threads.totalCount)
        this.threads.totalCount = totalCount + 1

        // 小程序
        this.changeInfo = { type: 'add', thread: threadInfo }
      }
    } else {
      this.updateAssignThreadAllData(threadId, threadInfo)
    }
  }

  /**
   * 点赞
   * @param {string | number} pid 评论id
   * @param {string | number} id 帖子id
   * @param {string | number} data 附件信息
   */
  @action
  async updateThreadInfo({ pid, id, data = {} } = {}) {
    return await updatePosts({ data: { pid, id, data } });
  };

  /**
   * 分享
   * @param {string | number} threadId 帖子id
   */
  @action
  async updateThreadShare({ threadId } = {}) {
    return await createThreadShare({ data: { threadId } });
  };

  /**
   * 根据 ID 获取当前选中的类别
   * @param {number} id 帖子类别id
   * @returns 选中的帖子详细信息
   */
  @action
  async getRecommends({ categoryIds = [] } = {}) {
    this.updateRecommendsStatus('loading');

    const result = await readRecommends({ params: { categoryIds } })
    if (result.code === 0) {
      this.setRecommends(result.data || []);
      this.updateRecommendsStatus('none');
      return this.recommends;
    } else {
      this.updateRecommendsStatus('error');
      return Promise.reject(result?.msg || '加载失败');
    }
  }

  /**
   * 推荐帖子
   * @param {Object} data
   */
  @action
  setRecommends(data) {
    this.recommends = data;
  }
  @action
  updateRecommendsStatus(status) {
    this.recommendsStatus = status;
  }


  adapterList(data = {}) {
    const { pageData = [], ...others } = data;

    const newpageData = pageData.map(item => {
      item.openedMore = false;

      return item;
    });

    return {
      pageData: newpageData,
      ...others
    };
  }
}

export default IndexAction;
