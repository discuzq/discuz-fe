import React from 'react';
import { inject, observer } from 'mobx-react';
import IndexH5Page from '@layout/index/h5';
import IndexPCPage from '@layout/index/pc';
import { readCategories, readStickList, readThreadList } from '@server';
import { Toast } from '@discuzq/design';
import HOCFetchSiteData from '../middleware/HOCFetchSiteData';

@inject('site')
@inject('index')
@inject('user')
@inject('baselayout')
@observer
class Index extends React.Component {

  state = {
    isError: false,
    errorText: ''
  }

  page = 1;
  prePage = 10;
  static async getInitialProps(ctx, { user, site }) {
    const categories = await readCategories({}, ctx);
    const sticks = await readStickList({}, ctx);

    const threads = await readThreadList({ params: { filter: {
      sort: 1,
      attention: 0,
      essence: 0
    }, sequence: 0, perPage: 10, page: 1 } }, ctx);

    return {
      serverIndex: {
        categories: categories && categories.code === 0 ? categories.data : null,
        sticks: sticks && sticks.code === 0 ? sticks.data : null,
        threads: threads && threads.code === 0 ? threads.data : null,
      },
    };
  }

  constructor(props) {
    super(props);
    const { serverIndex, index } = this.props;
    // 初始化数据到store中
    serverIndex && serverIndex.categories && index.setCategories(serverIndex.categories);
    serverIndex && serverIndex.sticks && index.setSticks(serverIndex.sticks);
    serverIndex && serverIndex.threads && index.setThreads(serverIndex.threads);
  }

  async componentDidMount() {
    const { index } = this.props;
    const { essence = 0, sequence = 0, attention = 0, sort = 1 } = index.filter;

    let newTypes = this.handleString2Arr(index.filter, 'types');

    let categoryIds = this.handleString2Arr(index.filter, 'categoryids');

    // 当服务器无法获取数据时，触发浏览器渲染
    const hasCategoriesData = !!index.categories;
    const hasSticksData = !!index.sticks;
    const hasThreadsData = !!index.threads;

    if (!hasCategoriesData) {
      this.props.index.getReadCategories();
    }
    if (!hasSticksData) {
      this.props.index.getRreadStickList(categoryIds);
    }
   
    if (!hasThreadsData) {
      try {
        await this.props.index.getReadThreadList({
          sequence, 
          filter: { categoryids: categoryIds, types: newTypes, essence, attention, sort } 
        });
      } catch (error) {
        this.setState({ isError: true, errorText: error })
      }
    } else {
      // 如果store中有值，则需要获取之前的分页数
      this.page = index.threads.currentPage || 1
    }
  }

  // 将字符串转成数组，且过滤掉不必要的参数
  handleString2Arr = (dic, key) => {
    if (!dic || !dic[key]) {
      return
    }

    const target = dic[key]
    let arr = [];
    if (target) {
      if (!(target instanceof Array)) {
        arr = [target];
      } else {
        arr = target;
      }
    }

    return arr?.filter(item => item !== 'all' && item !== 'default' && item !== '') || []
  }

  dispatch = async (type, data = {}) => {
    const { index, baselayout } = this.props;
    const { essence, sequence, attention, sort, page } = data;

    let newTypes = this.handleString2Arr(data, 'types');

    let categoryIds = this.handleString2Arr(data, 'categoryids');

    if (type === 'click-filter') { // 点击tab
      this.page = 1;
      try {
        await index.screenData({ filter: { categoryids: categoryIds, types: newTypes, essence, attention, sort }, sequence, page: this.page, });
      } catch (error) {
        this.setState({ isError: true, errorText: error })
      }
      this.props.baselayout.setJumpingToTop();
    } else if (type === 'moreData') {
      this.page += 1;
      return await index.getReadThreadList({
        perPage: this.prePage,
        page: this.page,
        filter: { categoryids: categoryIds, types: newTypes, essence, attention, sort },
        sequence,
      });
    } else if (type === 'refresh-recommend') {
      await index.getRecommends({ categoryIds });
    } else if (type === 'update-page') {// 单独更新页数
      this.page = page
    } else if (type === 'refresh-thread') { // 点击帖子更新数的按钮，刷新帖子数据
      this.page = 1;
      return await index.getReadThreadList({ filter: { categoryids: categoryIds, types: newTypes, essence, attention, sort }, sequence, page: this.page, });
    }
  }

  render() {
    const { site } = this.props;
    const { platform } = site;
    if (platform === 'pc') {
      return <IndexPCPage dispatch={this.dispatch} isError={this.state.isError} errorText={this.state.errorText} />;
    }
    return <IndexH5Page dispatch={this.dispatch} isError={this.state.isError} errorText={this.state.errorText} />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(Index);
