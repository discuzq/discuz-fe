import { action } from 'mobx';
import MessageStore from './store';
import { readDialogList, readMsgList, createDialog, deleteMsg, deleteDialog, readDialogMsgList, createDialogMsg, readUnreadCount, readDialogIdByUsername, updateDialog } from '@server';

class MessageAction extends MessageStore {
  // 根据username获取dialogId
  @action.bound
  async readDialogIdByUsername(username) {
    return readDialogIdByUsername({ params: { username } });
  }

  // 把对话消息设置为已读
  @action.bound
  async updateDialog(dialogId) {
    updateDialog({ data: { dialogId } });
  }

  // 获取未读消息数量
  @action.bound
  async readUnreadCount() {
    const ret = await readUnreadCount();
    const { code, data } = ret;
    if (code === 0) {
      const { unreadNotifications, typeUnreadNotifications, dialogNotifications } = data;
      const { threadrewardedexpired = 0, receiveredpacket = 0, related = 0, replied = 0, system = 0, withdrawal = 0, liked = 0, rewarded = 0, threadrewarded = 0 } = typeUnreadNotifications;
      // threadrewardedexpired, withdrawal, 悬赏过期、提现不在消息中心展示，未读总数需要减去此类型消息的未读数
      this.totalUnread = unreadNotifications - threadrewardedexpired - withdrawal + dialogNotifications;
      this.threadUnread = system;
      this.financialUnread = receiveredpacket + rewarded + threadrewarded;
      this.accountUnread = related + replied + liked;
      this.atUnread = related;
      this.replyUnread = replied;
      this.likeUnread = liked;
      this.dialogMessageUnread = dialogNotifications;
    }
  }

  // 设置消息分页的每页条数
  perPage = {
    perPage: 10,
  };

  // 组装获取消息列表的入参
  assemblyParams(page, types) {
    return {
      params: {
        ...this.perPage,
        page,
        filter: {
          type: types,
        },
      },
    };
  }

  // 设置消息列表数据
  @action
  setMsgList(currentPage, key, ret) {
    const { code, data = {} } = ret;
    if (code === 0) {
      // 更新未读消息数量
      if (key !== 'dialogMsgList') this.readUnreadCount();

      const { pageData: list = [] } = data;
      const listData = (({ totalPage = 0, totalCount = 0 }) => ({ list, totalPage, totalCount, currentPage }))(data);
      if (currentPage === 1) {
        // 刷新
        this[key] = listData;
      } else {
        // 加载下一页
        this[key] = {
          ...listData,
          list: this[key].list.concat(list),
        };
      }
    }
  }

  // 获取账号消息
  @action.bound
  async readAccountMsgList(page = 1) {
    const ret = await readMsgList(this.assemblyParams(page, 'related,replied,liked'));
    this.setMsgList(page, 'accountMsgList', ret);
  }

  // 获取@我的消息
  @action.bound
  async readAtMsgList(page = 1) {
    const ret = await readMsgList(this.assemblyParams(page, 'related'));
    this.setMsgList(page, 'atMsgList', ret);
  }

  // 获取回复我的消息
  @action.bound
  async readReplyMsgList(page = 1) {
    const ret = await readMsgList(this.assemblyParams(page, 'replied'));
    this.setMsgList(page, 'replyMsgList', ret);
  }

  // 获取点赞我的消息
  @action.bound
  async readLikeMsgList(page = 1) {
    const ret = await readMsgList(this.assemblyParams(page, 'liked'));
    this.setMsgList(page, 'likeMsgList', ret);
  }

  // 获取财务消息
  @action.bound
  async readFinancialMsgList(page = 1) {
    // threadrewardedexpired 悬赏过期，产品经理说不展示;withdrawal 提现信息放入钱包，不在消息展示
    const ret = await readMsgList(this.assemblyParams(page, 'rewarded,threadrewarded,receiveredpacket'));
    this.setMsgList(page, 'financialMsgList', ret);
  }

  // 获取帖子通知
  @action.bound
  async readThreadMsgList(page = 1) {
    const ret = await readMsgList(this.assemblyParams(page, 'system'));
    this.setMsgList(page, 'threadMsgList', ret);
  }

  // 获取对话列表
  @action.bound
  async readDialogList(page = 1) {
    const ret = await readDialogList({
      params: {
        perPage: 20,
        page,
      },
    });
    this.setMsgList(page, 'dialogList', ret);
  }

  // 获取对话的消息列表
  @action.bound
  async readDialogMsgList(dialogId, page = 1) {
    return new Promise(async (resolve) => {
      const ret = await readDialogMsgList({
        params: {
          perPage: 200,
          page,
          filter: {
            dialogId,
          },
        },
      });
      this.setMsgList(page, 'dialogMsgList', ret);
      resolve();
    });


    const ret = await readDialogMsgList({
      params: {
        perPage: 200,
        page,
        filter: {
          dialogId,
        },
      },
    });
    this.setMsgList(page, 'dialogMsgList', ret);
  }

  // 创建新的私信对话
  @action.bound
  async createDialog(params) {
    return createDialog(params);
  }

  // 私信对话发送新的消息
  @action.bound
  async createDialogMsg(params) {
    return await createDialogMsg(params);
  }

  // 删除私信对话
  @action.bound
  async deleteDialog(id) {
    const ret = await deleteDialog({ id });
    const { code } = ret;
    if (code === 0) this.deleteListItem('dialogList', id);
  }

  // 删除消息
  @action.bound
  async deleteMsg(id, storeKey) {
    const ret = await deleteMsg({ id });
    const { code } = ret;
    if (code === 0) this.deleteListItem(storeKey, id);
  }

  @action.bound
  clearMessage() {
    this.dialogMsgList = this.initList;
  }

  // 从store数据中删除消息
  deleteListItem(key, id) {
    // 每次删除消息后更新一下未读消息
    this.readUnreadCount();

    const data = this[key];
    const list = [].concat(...data.list)
    try {
      list.forEach((item, index) => {
        if (item.id === id) {
          list.splice(index, 1);
          this[key] = {
            ...data,
            list,
            totalCount: data.totalCount - 1,
          }
          throw 'break';
        }
      });
    } catch (e) {}
  }
}

export default MessageAction;
