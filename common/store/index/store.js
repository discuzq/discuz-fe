import { observable, computed } from 'mobx';
import ListStore from './list';

class IndexStore extends ListStore {
  constructor(props) {
    super(props);
  }

  @observable categories = null;

  @observable sticks = null;

  @observable threads = null;

  @observable drafts = null;

  @observable latestReq = 0;

  // 是否出现推荐选项
  @observable needDefault = false

  @computed get categoriesNoAll() {
    return (this.categories || []).filter(item => item.name !== '全部' && item.canCreateThread);
  }

  @computed get categoriesNames() {
    const categoriesNoAll = (this.categories || []).filter(item => item.name !== '全部');
    const nameArr = [];
    categoriesNoAll.forEach((item) => {
      nameArr.push({
        pid: item.pid,
        name: item.name,
      });
      item.children.forEach((child) => {
        nameArr.push({
          pid: child.pid,
          name: `${item.name}/${child.name}`,
        });
      });
    });
    return nameArr;
  }

  @observable filter = {
    categoryids: ['all'], // 这里的逻辑如果更改，记得需要更改下面的计算属性：isCurrentAllCategory
    sequence: 0,
    sort: 1,
    attention: 0,
    types: 'all',
    essence: 0,
  }

  // 首页当前分类是否是全部分类，这里会涉及到 action：isNeedAddThread 的判断，会涉及到发帖之后是否添加数据到首页的逻辑
  @computed
  get isCurrentAllCategory() {
    const { categoryids = [] } = this.filter || {};
    return categoryids.indexOf('all') !== -1;
  }

  // 解决小程序popup被tabBar遮挡的问题
  @observable hiddenTabBar = false

  // 小程序scroll-view被scroll-view嵌套，子元素不能使用同名属性来触发事件
  @observable hasOnScrollToLower = true; // 值为false时，第一层嵌套onScrollToLower被设置为null用于执行下一层onScrollToLower

  // 首页帖子报错信息
  @observable threadError = {
    isError: false,
    errorText: '加载失败',
  };

  // 首页分类报错信息
  @observable categoryError = {
    isError: false,
    errorText: '加载失败',
  };

  @observable recommends = null;
  @observable recommendsStatus = 'none'

  @observable topMenuIndex = '0'

  // 小程序增删使用
  @observable changeInfo = null
}

export default IndexStore;
