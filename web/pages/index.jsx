import React from 'react';
import { inject, observer } from 'mobx-react';
import IndexH5Page from '@layout/index/h5';
import IndexPCPage from '@layout/index/pc';
import { readCategories, readStickList, readThreadList } from '@server';
import { handleString2Arr } from '@common/utils/handleCategory';
import HOCFetchSiteData from '../middleware/HOCFetchSiteData';
import ViewAdapter from '@components/view-adapter';
import isServer from '@common/utils/is-server';
import browser from '@common/utils/browser';

@inject('site')
@inject('index')
@inject('user')
@inject('baselayout')
@inject('vlist')
@observer
class Index extends React.Component {

  state = {
    categoryError: false,
    categoryErrorText: '',
  }

  page = 1;
  prePage = 10;
  // static async getInitialProps(ctx, { user, site }) {
  //   const categories = await readCategories({}, ctx);
  //   const sticks = await readStickList({}, ctx);

  //   const threads = await readThreadList({ params: { filter: {
  //     sort: 1,
  //     attention: 0,
  //     essence: 0
  //   }, sequence: 0, perPage: 10, page: 1 } }, ctx);

  //   return {
  //     serverIndex: {
  //       categories: categories && categories.code === 0 ? categories.data : null,
  //       sticks: sticks && sticks.code === 0 ? sticks.data : null,
  //       threads: threads && threads.code === 0 ? threads.data : null,
  //     },
  //   };
  // }

  constructor(props) {
    super(props);
    const { serverIndex, index } = this.props;
    // 初始化数据到store中
    // serverIndex && serverIndex.categories && index.setCategories(serverIndex.categories);
    // serverIndex && serverIndex.sticks && index.setSticks(serverIndex.sticks);
    // serverIndex && serverIndex.threads && index.setThreads(serverIndex.threads);
  }

  componentDidMount() {
    this.handleRouterCategory()

    const { index } = this.props;
    const { essence = 0, sequence = 0, attention = 0, sort = 1 } = index.filter;

    let newTypes = handleString2Arr(index.filter, 'types');

    let categoryIds = handleString2Arr(index.filter, 'categoryids');

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
      this.props.index.getReadThreadList({
        sequence, 
        filter: { categoryids: categoryIds, types: newTypes, essence, attention, sort } 
      });
    } else {
      // 如果store中有值，则需要获取之前的分页数
      this.page = index.threads.currentPage || 1
    }
  }

  // 通过地址栏获取到当前分类信息
  handleRouterCategory = () => {
    // 识别通过分享过来的url
    // 若包含categoryId参数，则定位到具体的categoryId数据
    const { router, index, site } = this.props;
    let { categoryId = '', sequence = '0' } = router.query || {}

    // 路由中带值
    if (categoryId || sequence !== '0') {
      let ids = categoryId.split('_').map(item => {
        // 判断categoryId是否是数字。可能是all/default
        const id = /^\d+$/.test(item) ? Number(item) : item

        return id
      }).filter(item => item)

      // H5处理方案
      if (sequence === '1' && !ids?.length && site.platform === 'h5') {
        ids = ['default']
      }

      if (ids.indexOf('default') !== -1 && sequence === '0' && site.platform === 'h5') {
        sequence = '1'
      }

      // PC处理方案
      if (!ids?.length && site.platform === 'pc') {
        ids = ['all']
      }

      // 设置PC端顶部
      if (sequence !== '0' && site.platform === 'pc') {
        index.topMenuIndex = `${sequence}`
      }

      const newFilter = { ...index.filter, categoryids: ids, sequence };

      index.setFilter(newFilter);
    } else {
      // 路由中不带值，从store中获取
      const { categoryids, sequence: seq } = index.filter || {}
      this.setUrl(categoryids, seq)
    }
  }

  // 根据选中的筛选项，设置地址栏 
  setUrl = (categoryIds = [], sequence = 0) => {
    const url = (categoryIds?.length || sequence !== 0)  ? `/?categoryId=${categoryIds.join('_')}&sequence=${sequence}` : '/'
    this.props.router.replace(url)
  }

  dispatch = async (type, data = {}) => {
    const { index } = this.props;
    const newData = {...index.filter, ...data}
    const { essence, sequence, attention, sort, page } = newData;

    let newTypes = handleString2Arr(newData, 'types');

    let categoryIds = handleString2Arr(newData, 'categoryids');

    // 每次请求前，先判断错误状态，并重置
    if (this.props.index?.threadError?.isError) {
      this.props.index.threadError = {
        isError: false,
        errorText: ''
      }
    }

    if (type === 'click-filter') { // 点击tab
      this.setUrl(categoryIds, sequence)

      this.page = 1;
      this.props.baselayout.setJumpingToTop();
      this.props.vlist.setPosition(0);
      await index.screenData({ filter: { categoryids: categoryIds, types: newTypes, essence, attention, sort }, sequence, page: this.page, });
    } else if (type === 'moreData') {
      const { currentPage = 0 } = this.props.index.threads || {}
      this.page += 1;

      if (currentPage < this.page) {
        return await index.getReadThreadList({
          perPage: this.prePage,
          page: this.page,
          filter: { categoryids: categoryIds, types: newTypes, essence, attention, sort },
          sequence,
        });
      } else {
        this.page = currentPage
        return Promise.resolve()
      }
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
    const { categoryName = '' } = this.props.index || {}
    return <ViewAdapter
            h5={<IndexH5Page dispatch={this.dispatch} />}
            pc={<IndexPCPage dispatch={this.dispatch} />}
            title={categoryName}
          />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(Index, (pass) => {
  // 因部署方式的问题，所有路径第一次访问都会访问index.html，导致会出现首页渲染出来之后跳转到制定的url地址，为了防止这种情况，对首页的渲染做一次判断，如果url不是首页连接，将不渲染首页。
  if (!isServer() && !browser.env('uc')) { // uc浏览器存在异常，首页不做判断
    const pathname = window.location.pathname;
    if (pathname === '/' || pathname === '/index') {
      return true;
    } else {
      return false;
    }
  }
  return pass;
});
