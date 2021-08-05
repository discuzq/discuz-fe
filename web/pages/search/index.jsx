import React from 'react';
import { inject, observer } from 'mobx-react';
import IndexH5Page from '@layout/search/h5';
import IndexPCPage from '@layout/search/pc';
import { readUsersList, readTopicsList, readThreadList } from '@server';
import { Toast } from '@discuzq/design';
import ViewAdapter from '@components/view-adapter';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';

@inject('site')
@inject('search')
@observer
class Index extends React.Component {
  static async getInitialProps(ctx) {
    const search = ctx?.query?.keyword || '';

    const topicFilter = {
      hot: 1,
      content: search,
    };

    const topics = await readTopicsList({ params: { filter: topicFilter, perPage: 10 } }, ctx);
    const users = await readUsersList({ params: { filter: { nickname: search }, perPage: 10 } }, ctx);
    const threads = await readThreadList({ params: { filter: { sort: '3', search }, perPage: 10 } }, ctx);

    return {
      serverSearch: {
        indexTopics: topics?.data,
        indexUsers: users?.data,
        indexThreads: threads?.data,
      },
    };
  }

  constructor(props) {
    super(props);
    const { serverSearch, search } = this.props;
    // 初始化数据到store中
    const { platform } = this.props.site || {};

    if (platform === 'pc') {
      search.resetIndexData();
    } else {
      serverSearch && serverSearch.indexTopics && search.setIndexTopics(serverSearch.indexTopics);
      serverSearch && serverSearch.indexUsers && search.setIndexUsers(serverSearch.indexUsers);
      serverSearch && serverSearch.indexThreads && search.setIndexThreads(serverSearch.indexThreads);
    }

    this.state = {
      stepIndex: 0,
      searchNoData: false
    }
  }

  async componentDidMount() {
    const { search, router } = this.props;
    const { keyword = '' } = router?.query;

    const { platform } = this.props.site || {};

    if (platform === 'pc') {
      this.setState({ searchNoData: false })
      await search.getSearchData({ hasTopics: false, hasUsers: false, hasThreads: false, search: keyword });
      this.requestAgain()
    } else {
      const hasIndexTopics = !!search.indexTopics;
      const hasIndexUsers = !!search.indexUsers;
      const hasIndexThreads = !!search.indexThreads;
      search.getSearchData({ hasTopics: hasIndexTopics, hasUsers: hasIndexUsers, hasThreads: hasIndexThreads, search: keyword });
    }
  }

  // 获取数据状态
  setStepIndex = () => {
    const { hasTopics, hasUsers, hasThreads, isShowAll, isNoData } = this.props.search.dataIndexStatus

    let stepIndex = 0
    if (isNoData) {
      stepIndex = this.state.stepIndex
    } else if (isShowAll) {
      stepIndex = 0
    } else {
      if (hasTopics) {
        stepIndex = 0
      } else if (!hasTopics && hasUsers) {
        stepIndex = 1
      } else if (!hasTopics && !hasUsers) {
        stepIndex = 2
      }
    }

    this.setState({ stepIndex })
  }

  dispatch = async (type, data = '') => {
    const { search, site } = this.props;

    if (type === 'refresh') {
      search.getSearchData({ hasTopics: false, hasUsers: false, hasThreads: false });
    } else if (type === 'search') {
      // 判断，如果是PC端，先执行清除数据操作
      if (site.platform === 'pc') {
        search.resetIndexData()
      }
      this.setState({ searchNoData: false })
      await search.getSearchData({ search: data });
      this.requestAgain()
    } else if (type === 'update-step-index') {
      this.setState({ stepIndex: data || 0 })
    }
  }

  requestAgain = async () => {
    const { platform } = this.props.site || {};
    const { isNoData } = this.props.search.dataIndexStatus

    // 若搜索数据为空，在发起一次请求
    if (platform === 'pc' && isNoData) {
      this.setState({ searchNoData: true })
      await this.props.search.getSearchData({ hasTopics: false, hasUsers: false, hasThreads: false });
    }

    this.setStepIndex()
  }

  render() {
    return (
      <ViewAdapter
        h5={<IndexH5Page dispatch={this.dispatch} />}
        pc={ <IndexPCPage dispatch={this.dispatch} stepIndex={this.state.stepIndex} searchNoData={this.state.searchNoData} />}
        title='发现'
      />
    );
    
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(Index);
