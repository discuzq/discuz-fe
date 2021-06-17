import React from 'react';
import { inject, observer } from 'mobx-react';
import BaseLayout from '@components/base-layout';
import SidebarPanel from '@components/sidebar-panel';
import ThreadContent from '@components/thread';
import { withRouter } from 'next/router';
import styles from './index.module.scss';
import PopTopic from '@components/pop-topic';
import Copyright from '@components/copyright';

@inject('site')
@inject('search')
@observer
class SearchResultPostH5Page extends React.Component {
  constructor(props) {
    super(props);

    const keyword = this.props.router.query.keyword || '';

    this.state = {
      keyword,
      refreshing: false,
    };
  }

  fetchMoreData = () => {
    const { dispatch } = this.props;
    const { keyword } = this.state;
    return dispatch('moreData', keyword);
  };

  searchData = (keyword) => {
    const { dispatch } = this.props;
    dispatch('refresh', keyword);
  };

  onSearch = (value) => {
    this.setState({ keyword: value }, () => {
      this.searchData(value);
    });
  }

  render() {
    const { pageData, currentPage, totalPage } = this.props.search.threads || {};
    const { threadsError } = this.props.search || {}

    return (
      <BaseLayout
        onSearch={this.onSearch}
        noMore={currentPage >= totalPage}
        onRefresh={this.fetchMoreData}
        showRefresh={false}
        isShowLayoutRefresh={!!pageData?.length}
        className="search-result-post"
        right={<><PopTopic /><Copyright/></>}
      >
        <SidebarPanel
          title="热门内容"
          type='large'
          isShowMore={false}
          isLoading={!pageData}
          noData={!pageData?.length}
          icon={{ type: 3, name: 'HotOutlined' }}
          mold='plane'
          isError={threadsError.isError}
          errorText={threadsError.errorText}
        >
          {
            pageData?.map((item, index) => (
              <ThreadContent className={index ===0 ? styles.borderRadius : ''} showBottom={false} data={item} key={index} />
            ))
          }
        </SidebarPanel>
      </BaseLayout>
    );
  }
}

export default withRouter(SearchResultPostH5Page);
