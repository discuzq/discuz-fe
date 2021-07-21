import { action } from 'mobx';
import ThreadStore from './store';
import { readThreadDetail } from '@server';
class ThreadAction extends ThreadStore {
  constructor(props) {
    super(props);
  }

  /**
   * 获取帖子详细信息
   * @param {number} id 帖子id
   * @returns 帖子详细信息
   */
  @action
  async fetchThreadDetail(id) {
    const params = { threadId: id };
    const ret = await readThreadDetail({ params });
    const { code, data } = ret;
    if (code === 0) {
      this.setThreadData(data);
      this.setReady();
    }
    return ret;
  }
  @action
  setThreadData(data) {
    this.threadData = data;
    this.threadData.id = data.threadId;
  }
  @action
  setReady() {
    this.isReady = true;
  }
}

export default ThreadAction;
