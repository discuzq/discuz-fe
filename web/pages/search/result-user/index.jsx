import React from 'react';
import { inject, observer } from 'mobx-react';
import IndexH5Page from '@layout/search/result-user/h5';
import IndexPCPage from '@layout/search/result-user/pc';
import { readTopicsList, readUsersList } from '@server';
import { Toast } from '@discuzq/design';

import HOCFetchSiteData from '@middleware/HOCFetchSiteData';

@inject('site')
@inject('search')
@observer
class Index extends React.Component {
  // static async getInitialProps(ctx) {
  //   const search = ctx?.query?.keyword || '';
  //   const topicFilter = {
  //     hot: 0,
  //     content: search,
  //   };
  //   const result = await readUsersList({ params: { filter: { username: search } } });
  //   const topics = await readTopicsList({ params: { filter: topicFilter, perPage: 10 } });
  //   return {
  //     serverSearch: {
  //       users: result?.data,
  //       topics: topics?.data,
  //     },
  //   };
  // }

  page = 1;
  perPage = 20;

  constructor(props) {
    super(props);
    const { serverSearch, search } = this.props;
    // 初始化数据到store中
    search.setUsers(null);
    search.setTopics(null);
  }

  async componentDidMount() {
    const { search, router } = this.props;
    const { keyword = '' } = router.query;
    // 当服务器无法获取数据时，触发浏览器渲染
    const hasUsers = !!search.users;
    const hasTopics = !!search.topics;

    // if (!hasUsers) {
      // this.toastInstance = Toast.loading({
      //   content: '加载中...',
      //   duration: 0,
      // });

      this.page = 1;
      await search.getUsersList({ search: keyword, perPage: this.perPage });
      this.toastInstance?.destroy();
    // }
    // if (!hasTopics) {
      // search.getTopicsList({ search: keyword, perPage: 1});
    // }
  }
  dispatch = async (type, data) => {
    const { search } = this.props;

    if (type === 'refresh') {
      this.page = 1;
      search.setUsers(null);
    } else if (type === 'moreData') {
      this.page += 1;
    }
    await search.getUsersList({ search: data, perPage: this.perPage, page: this.page });
    return;
  }

  render() {
    const { site } = this.props;
    const { platform } = site;

    if (platform === 'pc') {
      return <IndexPCPage dispatch={this.dispatch} />;
    }

    return <IndexH5Page dispatch={this.dispatch} />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(Index);
