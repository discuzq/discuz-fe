import React from 'react';
import { inject, observer } from 'mobx-react';
import IndexH5Page from '@layout/search/result-user';
import { readUsersList } from '@server';
import { Toast } from '@discuzq/design';
import Page from '@components/page';
import HOCFetchSiteData from '@common/middleware/HOCFetchSiteData';
import { getCurrentInstance } from '@tarojs/taro';

@inject('site')
@inject('search')
@observer
class Index extends React.Component {
  static async getInitialProps(ctx) {
    const search = ctx?.query?.keyword || '';
    const result = await readUsersList({ params: { filter: { username: search } } });

    return {
      serverSearch: {
        users: result?.data,
      },
    };
  }

  page = 1;
  perPage = 10;

  constructor(props) {
    super(props);
    const { serverSearch, search } = this.props;
    console.log(this.props, 'props')
    // 初始化数据到store中
    serverSearch && serverSearch.users && search.setUsers(serverSearch.users);
  }

  async componentDidMount() {
    const { search, router } = this.props;
    console.log(search, 'search');
    // const { keyword = '' } = router.query;
    const { keyword = '' } = getCurrentInstance().router.params;
    // 当服务器无法获取数据时，触发浏览器渲染
    const hasUsers = !!search.indexUsers;

    if (!hasUsers) {
      this.toastInstance = Toast.loading({
        content: '加载中...',
        duration: 0,
      });

      this.page = 1;
      await search.getUsersList({ search: keyword });

      this.toastInstance?.destroy();
    }
  }

  dispatch = async (type, data) => {
    console.log('dispatch', type, data)
    const { search } = this.props;

    if (type === 'refresh') {
      this.page = 1;
    } else if (type === 'moreData') {
      this.page += 1;
    }

    await search.getUsersList({ search: data, perPage: this.perPage, page: this.page });
    return;
  }

  render() {
    return (
      <Page>
        <IndexH5Page dispatch={this.dispatch} />
      </Page>
    );
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(Index);
