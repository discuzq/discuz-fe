import { observable, computed, action, extendObservable } from 'mobx';
import { readThreadList } from '@server';
import { get } from '@common/utils/get';

// 定义统一的 list 数据结构
export default class ListStore {
  // 所有的 list 集合数据存储
  @observable lists = {};

  @action
  registerList = ({
    namespace,
  }) => {
    if (this.lists[namespace]) return;
    extendObservable(this.lists, {
      [namespace]: {
        data: {},
        requestError: {
          isError: false,
          errorText: '加载失败',
        },
        attribs: {},
      },
    });
  }

  /**
   * 获取指定命名空间的 list
   * @param {*} param0
   * @returns
   */
  @action
  getList = ({ namespace }) => {
    if (!this.lists[namespace]) {
      this.registerList({ namespace });
      return [];
    }

    return this.listAdapter(this.lists[namespace]);
  }

  // 列表适配器，可以拍平含有分页的列表数据
  @action
  listAdapter = (listInstance) => {
    const { data } = listInstance;
    let listArray = [];
    Object.values(data).forEach((pageData) => {
      listArray = [...listArray, ...pageData];
    });
    return listArray;
  }

  /**
   * 请求获取 list
   * @param {*} param0
   */
  @action
  fetchList = async ({ namespace, filter = {}, sequence = 0, perPage = 10, page }) => {
    let requestPage = page;
    if (!page) {
      requestPage = this.getAttribute({ namespace, key: 'currentPage' }) + 1 || 1;
    }
    const newFilter = filter;
    if (filter.categoryids && (filter.categoryids instanceof Array)) {
      const newCategoryIds = filter.categoryids?.filter(item => item);
      if (!newCategoryIds.length) {
        delete newFilter.categoryids;
      }
    }
    const result = await readThreadList({ params: { perPage, page: requestPage, filter: newFilter, sequence } });
    if (result.code === 0 && result.data) {
      return result;
    }

    this.setListRequestError({ namespace, errorText: result?.msg || '' });

    return Promise.reject(result?.msg || '');
  }


  /**
   * 设置列表错误
   * @param {*} param0
   * @returns
   */
  @action
  setListRequestError = ({ namespace, errorText }) => {
    if (!this.lists[namespace]) {
      this.registerList({ namespace });
    };

    this.lists[namespace].requestError.isError = true;
    this.lists[namespace].requestError.errorText = errorText;

    this.lists = { ...this.lists };
  }

  /**
   * 获取指定列表的错误信息
   * @param {*} param0
   * @returns
   */
  @action
  getListRequestError = ({ namespace }) => {
    if (!this.lists[namespace]) {
      this.registerList({ namespace });
    }

    return this.lists[namespace].requestError;
  }


  @action
  deleteListItem = ({ item }) => {
    this.deleteAssignThreadInLists({ threadId: item.threadId });
  }


  /**
   * 初始化列表
   * @param {*} param0
   */
  @action
  setList = ({ namespace, data, page }) => {
    let listPage = page;
    if (!page) {
      listPage = this.getAttribute({ namespace, key: 'currentPage' }) + 1 || 1;
    }
    if (!this.lists[namespace]) {
      this.registerList({ namespace });
    }

    this.lists[namespace].data[listPage] = get(data, 'data.pageData');

    if (!this.getAttribute({ namespace, key: 'currentPage' }) || Number(this.getAttribute({ namespace, key: 'currentPage' })) <= Number(get(data, 'data.currentPage'))) {
      this.setAttribute({ namespace, key: 'currentPage', value: get(data, 'data.currentPage') });
    }
    this.setAttribute({ namespace, key: 'totalPage', value: get(data, 'data.totalPage') });
    this.setAttribute({ namespace, key: 'totalCount', value: get(data, 'data.totalCount') });

    this.lists = { ...this.lists };
  }

  /**
   * 清空指定 namespace 的列表
   * @param {*} param0
   */
  @action
  clearList = ({ namespace }) => {
    if (!this.lists[namespace]) return;

    this.lists[namespace].data = {};
    this.lists[namespace].attribs = {};
    this.lists[namespace].requestError = {
      isError: false,
      errorText: '',
    };

    // 全量赋值，才能触发渲染
    this.lists = { ...this.lists };
  }

  /**
   * 获取所有的列表
   * @returns
   */
  @action
  getAllLists = () => this.lists;


  /**
   * 设置附加属性
   * @param {*} param0
   * @returns
   */
  @action
  setAttribute = ({ namespace, key, value }) => {
    if (!this.lists[namespace]) return;

    this.lists[namespace].attribs[key] = value;

    this.lists = { ...this.lists };
  }


  /**
   * 获取指定的附加属性
   * @param {*} param0
   * @returns
   */
  @action
  getAttribute = ({ namespace, key }) => {
    if (!this.lists[namespace]) return null;

    return this.lists[namespace].attribs[key];
  }

  /**
   * 在指定列表新增帖子
   * @param {*} param0
   */
  @action
  addThreadInTargetList = ({ namespace, threadInfo }) => {
    if (!this.lists[namespace]) {
      this.registerList({ namespace });
      this.lists[namespace].data[1] = [];
    }

    this.lists[namespace].data[1].unshift(threadInfo);

    this.lists = { ...this.lists };
  }

  /**
   * 在所有的列表中找到指定 id 的 thread
   * @param {*} param0
   */
  @action
  findAssignThreadInLists = ({ threadId }) => {
    let resultList = [];

    Object.keys(this.lists).forEach((listName) => {
      const listSearchResult = this.findAssignThreadInTargetList({ namespace: listName, threadId });

      resultList = [...resultList, ...listSearchResult];
    });

    return resultList;
  }

  /**
   * 在指定的列表里找到指定 id 的 thread
   * @param {*} param0
   */
  @action
  findAssignThreadInTargetList = ({ threadId, namespace }) => {
    if (!this.lists[namespace]) return null;

    const resultList = [];

    const { data } = this.lists[namespace];

    Object.keys(data).forEach((page) => {
      data[page].forEach((thread, index) => {
        if (thread.threadId === threadId) {
          resultList.push({
            listName: namespace,
            page,
            index,
            data: thread,
          });
        }
      });
    });

    return resultList;
  }

  /**
   * 在所有的列表里更新指定的 thread
   * @param {*} param0
   */
  @action
  updateAssignThreadInfoInLists = ({ threadId, threadInfo }) => {
    const targetThreads = this.findAssignThreadInLists({ threadId });

    targetThreads.forEach(({ listName, page, index }) => {
      this.lists[listName].data[page][index] = threadInfo;
    });

    this.lists = { ...this.lists };
  }

  /**
   * 在列表中删除指定的 thread
   * @param {*} param0
   */
  @action
  deleteAssignThreadInLists = ({ threadId }) => {
    const targetThreads = this.findAssignThreadInLists({ threadId });

    targetThreads.forEach(({ listName, page, index }) => {
      this.lists[listName].data[page].splice(index, 1);
    });

    this.lists = { ...this.lists };
  }
}
