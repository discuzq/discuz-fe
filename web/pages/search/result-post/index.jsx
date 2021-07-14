import React from 'react';
import { inject, observer } from 'mobx-react';
import IndexH5Page from '@layout/search/result-post/h5';
import IndexPCPage from '@layout/search/result-post/pc';
import { readThreadList } from '@server';
import { Toast } from '@discuzq/design';
import ViewAdapter from '@components/view-adapter';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';

@inject('site')
@inject('search')
@observer
class Index extends React.Component {
  // static async getInitialProps(ctx) {
  //   const search = ctx?.query?.keyword || '';
  //   const result = await readThreadList({ params: { filter: { sequence: '0', filter: { sort: '3', search } } } }, ctx);

  //   return {
  //     serverSearch: {
  //       threads: result?.data,
  //     },
  //   };
  // }

  page = 1;
  perPage = 10;

  constructor(props) {
    super(props);
    const { serverSearch, search } = this.props;
    // 初始化数据到store中
    search.setThreads(null);

    this.state = {
      repeatedIds: []
    }
  }

  async componentDidMount() {
    const { search, router } = this.props;
    const { keyword = '' } = router.query;
    // 当服务器无法获取数据时，触发浏览器渲染
    const hasThreads = !!search.threads;

    this.page = 1;
    const res = await search.getThreadList({ search: keyword });

    this.handleFirstRequest(res)
  }

  dispatch = async (type, keyword, params) => {
    const { search } = this.props;
    const { repeatedIds = [] } = params || this.state || {}

    if (type === 'refresh') {
      this.page = 1;
      search.setThreads(null);
      this.setState({ repeatedIds: [] })
    } else if (type === 'moreData') {
      this.page += 1;
    }

    // 根据page值，动态设置sort
    const sort = this.page === 1 ? '3' : '4'

    const res = await search.getThreadList({ search: keyword, repeatedIds, sort, perPage: this.perPage, page: this.page });

    if (this.page === 1) {
      this.handleFirstRequest(res, keyword)
    }

    return;
  }

  handleFirstRequest = (res, keyword = '') => {
    if (!res) {
      return
    }

    const ids = res.pageData?.map(item => item.threadId)
    this.setState({ repeatedIds: ids })

    if (ids.length < 10) {
      this.dispatch('moreData', keyword, { repeatedIds: ids })
    }
  }

  render() {
    return (
      <ViewAdapter
        h5={<IndexH5Page dispatch={this.dispatch} />}
        pc={ <IndexPCPage dispatch={this.dispatch} />}
        title='热门内容'
      />
    );
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(Index);
