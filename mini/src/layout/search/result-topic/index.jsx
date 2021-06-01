import React from 'react';
import { inject, observer } from 'mobx-react';
import SearchInput from '@components/search-input';
import BaseLayout from '@components/base-layout';
import TopicItem from '@components/topic-item'
import styles from './index.module.scss';
import { View, Text, Image } from '@tarojs/components'
import Taro, { getCurrentInstance } from '@tarojs/taro';

@inject('search')
@observer
class SearchResultTopicH5Page extends React.Component {
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
    this.props.router.back();
  };

  onSearch = (keyword) => {
    this.setState({ keyword }, () => {
      this.refreshData();
    });
  };

  onTopicClick = data => {
    Taro.navigateTo({
      url: `/subPages/topic/topic-detail/index?id=${data.topicId || ''}`
    })
  }

  render() {
    const { keyword } = this.state;
    const { topics } = this.props.search;
    const { pageData = [], currentPage, totalPage } = topics || { pageData: [] };

    return (
        <BaseLayout
          onRefresh={this.fetchMoreData}
          noMore={currentPage >= totalPage}
          showHeader={false}
        >
          <SearchInput onSearch={this.onSearch} onCancel={this.onSearch} defaultValue={keyword} />
          <View className={styles.wrapper}>
            {
              pageData?.map((item, index) => (
                <TopicItem key={index} data={item} onClick={this.onTopicClick} />
              ))
            }
          </View>
        </BaseLayout>
    );
  }
}

export default SearchResultTopicH5Page;
