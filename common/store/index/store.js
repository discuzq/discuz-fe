import { observable, computed } from 'mobx';
class IndexStore {
  constructor() {}

  @observable categories = null;

  @observable sticks = null;

  @observable threads = null;

  @observable drafts = null;

  @computed get categoriesNoAll() {
    return (this.categories || []).filter(item => item.name !== '全部');
  }
  @observable recommends = null;
  @observable recommendsStatus = 'none'

  @observable filter = {
    categoryids: ['all'], // 这里的逻辑如果更改，记得需要更改下面的计算属性：isCurrentAllCategory
    sequence: 0,
    sort: 1,
    attention: 0,
    types: 'all',
    essence: 0
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
}

export default IndexStore;
