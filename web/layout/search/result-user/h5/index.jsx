import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import SearchInput from '@components/search-input';
import BaseLayout from '@components/base-layout';
import UserItem from '@components/thread/user-item';

import styles from './index.module.scss';

@inject('site')
@inject('search')
@observer
class SearchResultUserH5Page extends React.Component {
  constructor(props) {
    super(props);

    const keyword = this.props.router.query.keyword || '';

    this.state = {
      keyword,
      refreshing: false,
    };
  }

  // data
  refreshData = () => {
    const { dispatch } = this.props;
    const { keyword } = this.state;
    dispatch('refresh', keyword);
  };

  fetchMoreData = () => {
    const { dispatch } = this.props;
    const { keyword } = this.state;
    return dispatch('moreData', keyword);
  };

  // event
  onCancel = () => {
    this.props.router.back();
  };

  onSearch = (keyword) => {
    this.props.search.currentUserKeyword = keyword;
    this.setState({ keyword }, () => {
      this.refreshData();
    });
  };

  onUserClick = (id) => {
    this.props.router.push(`/user/${id}`);
  };

  render() {
    const { keyword } = this.state;
    const { users, usersError } = this.props.search;
    const { pageData = [], currentPage, totalPage } = users || { pageData: [] };
    console.log(`keyword`, keyword)
    return (
      <BaseLayout
        onRefresh={this.fetchMoreData}
        noMore={currentPage >= totalPage}
        requestError={usersError.isError}
        errorText={usersError.errorText}
        pageName="resultUser"
      >
        <SearchInput onSearch={this.onSearch} onCancel={this.onCancel} defaultValue={keyword} searchWhileTyping/>
        {
          pageData?.map((item, index) => (
            <UserItem
              key={index}
              title={item.nickname}
              imgSrc={item.avatar}
              label={item.groupName}
              userId={item.userId}
              onClick={this.onUserClick}
              className={styles.userItem}
            />
          ))
        }
      </BaseLayout>
    );
  }
}

export default withRouter(SearchResultUserH5Page);
