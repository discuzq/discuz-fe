import React from 'react';
import { inject, observer } from 'mobx-react';
import SearchInput from '@components/search-input';
import BaseLayout from '@components/base-layout';
import UserItem from '@components/thread/user-item';
import Taro, { getCurrentInstance } from '@tarojs/taro';

import styles from './index.module.scss';
@inject('site')
@inject('search')
@observer
class SearchResultUserH5Page extends React.Component {
  constructor(props) {
    super(props);

    const { keyword = '' } = getCurrentInstance().router.params;

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
    Taro.navigateBack()
  };

  onSearch = (keyword) => {
    this.setState({ keyword }, () => {
      this.refreshData();
    });
  };

  onUserClick = ({ userId } = {}) => {
    Taro.navigateTo({url: `/my/others?isOtherPerson=true&otherId=${userId}`});
  };

  render() {
    const { keyword } = this.state;
    const { users } = this.props.search;
    const { pageData = [], currentPage, totalPage } = users || { pageData: [] };

    return (
      <BaseLayout
        onRefresh={this.fetchMoreData}
        noMore={currentPage >= totalPage}
        showHeader={false}
      >
        <SearchInput onSearch={this.onSearch} onCancel={this.onSearch} defaultValue={keyword} searchWhileTyping/>
        {
          pageData?.map((item, index) => (
            <UserItem
              key={index}
              title={item.nickname}
              imgSrc={item.avatar}
              label={item.groupName}
              onClick={this.onUserClick}
              needPadding={true}
              needBottomLine={true}
              itemStyle={{paddingTop: '16px', paddingBottom: '16px'}}
            />
          ))
        }
      </BaseLayout>
    );
  }
}

export default SearchResultUserH5Page;
