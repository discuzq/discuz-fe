import { action } from 'mobx';
import TopicStore from './store';
import { readTopicsList } from '../../server';
import typeofFn from '@common/utils/typeof';
import threadReducer from '../thread/reducer';

class TopicAction extends TopicStore {
  constructor(props) {
    super(props);
  }

  @action
  setTopics(data) {
    this.topics = data;
  }

  @action
  setTopicDetail(data) {
    this.topicDetail = data;
  }

  /**
 * 话题 - 列表
 * @param {object} search * 搜索值
 * @returns {object} 处理结果
 */
  @action
  async getTopicsList({ search = '', sortBy = '1', perPage = 10, page = 1 } = {}) {
    const topicFilter = {
      sortBy,
      content: search,
      hot: 0
    };
    const result = await readTopicsList({ params: { filter: topicFilter, perPage, page } });

    if (result.code === 0 && result.data) {
      if (this.topics && result.data.pageData && page !== 1) {
        this.topics.pageData.push(...result.data.pageData);
        const newPageData = this.topics.pageData.slice();
        this.setTopics({ ...result.data, pageData: newPageData });
      } else {
        // 首次加载，先置空，是为了列表回到顶部
        this.setTopics({ pageData: [] });
        this.setTopics(result.data);
      }
      return result.data;
    }
    
    return Promise.reject(result?.msg || '');
  };

  /**
 * 话题 - 列表
 * @param {object} search * 搜索值
 * @returns {object} 处理结果
 */
  @action
  async getTopicsDetail({ topicId = '' } = {}) {
    const topicFilter = {
      topicId,
      hot: 0
    };
    const result = await readTopicsList({ params: { filter: topicFilter } });

    if (result.code === 0 && result.data) {
      return this.setTopicDetail(result.data);
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
     if (id && this.topicDetail) {
        const { pageData = [] } = this.topicDetail;
        this.topicDetail.pageData = pageData.map(data => {
          return data.threads?.filter(item => item.threadId !== id)
        })
     }
   }

    // 获取指定的帖子数据
  findAssignThread(threadId) {
    if (this.topicDetail) {
      let obj = null
      const { pageData = [] } = this.topicDetail;
      for (let i = 0; i < pageData.length; i++)  {
        pageData[i].threads?.forEach((item, j) => {
          if (item.threadId === threadId) {
            obj = { index: i, subIndex: j, data: item };
          }
        })
      }
      return obj;
    }
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

     const { index, subIndex } = targetThread;
     if (this.topicDetail?.pageData) {
       this.topicDetail.pageData[index].threads[subIndex] = obj;
     }
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
      const targetThread = this.findAssignThread(threadId);
      if (!targetThread || targetThread.length === 0) return;
      
      const { index, data } = targetThread;
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
  
      if (this.threads?.pageData) {
        this.threads.pageData[index] = data;
      }
    }


    /**
     * 话题页面 - 清空缓存数据
     */
    @action
    resetTopicsData() {
      this.setTopics(null)
      this.setTopicDetail(null)
    }
}

export default TopicAction;
