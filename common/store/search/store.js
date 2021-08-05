import { observable } from 'mobx';
class SearchStore {
  // 发现页
  @observable indexTopics = null
  @observable indexUsers = null
  @observable indexThreads = null

  // 更多页
  @observable topics = null
  @observable users = null
  @observable threads = null

  // 搜索页
  @observable searchTopics = null
  @observable searchUsers = null
  @observable searchThreads = null

  // 错误信息
  @observable indexTopicsError = { isError: false, errorText: '' }
  @observable indexUsersError = { isError: false, errorText: '' }
  @observable indexThreadsError = { isError: false, errorText: '' }

  @observable searchTopicsError = { isError: false, errorText: '' }
  @observable searchUsersError = { isError: false, errorText: '' }
  @observable searchThreadsError = { isError: false, errorText: '' }

  @observable topicsError = { isError: false, errorText: '' }
  @observable usersError = { isError: false, errorText: '' }
  @observable threadsError = { isError: false, errorText: '' }
  
  @observable currentKeyword = null

  @observable searchNoData = false
}

export default SearchStore;
