import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';

// import SearchInput from '@components/search-input';
import SearchInput from '.././../../components/search-input';
import SectionTitle from './components/section-title';
import TrendingTopics from './components/trending-topics';
import ActiveUsers from './components/active-users';
import PopularContents from './components/popular-contents';

import styles from './index.module.scss';
import '@discuzq/design/dist/styles/index.scss';

@inject('site')
@observer
class SearchH5Page extends React.Component {
  onSearch = (keyword) => {
    this.props.router.push(`/search/result?keyword=${keyword || ''}`);
  };

  redirectToSearchResultPost = () => {
    this.props.router.push('/search/result-post');
  };

  redirectToSearchResultUser = () => {
    this.props.router.push('/search/result-user');
  };

  redirectToSearchResultTopic = () => {
    this.props.router.push('/search/result-topic');
  };
  onUserClick = data => console.log('user click', data);
  onTopicClick = data => console.log('topic click', data);
  onPostClick = data => console.log('post click', data);

  onCancel = () => {
    this.props.router.back();
  };

  render() {
    return (
      <div className={styles.page}>
        <div className={styles.section}>
          <SearchInput onSearch={this.onSearch} onCancel={this.onCancel} />
          <SectionTitle title="潮流话题" onShowMore={this.redirectToSearchResultTopic} />
          <TrendingTopics data={TrendingTopicsData} onItemClick={this.onTopicClick} />
        </div>
        <div className={styles.hr} />
        <div className={styles.section}>
          <SectionTitle title="活跃用户" onShowMore={this.redirectToSearchResultUser} />
          <ActiveUsers data={ActiveUsersData} onItemClick={this.onUserClick} />
        </div>
        <div className={styles.hr} />
        <div className={`${styles.section} ${styles.popularContents}`}>
          <SectionTitle title="热门内容" onShowMore={this.redirectToSearchResultPost} />
        </div>
        <PopularContents data={Array(2).fill('')} onItemClick={this.onPostClick} />
      </div>
    );
  }
}

const TrendingTopicsData = Array(5).fill('#pc端功能建议#')
  .concat(Array(5).fill('#pc端功能建议pc端功能建议#'));
const ActiveUsersData = Array(5)
  .fill({ name: '123321' })
  .concat(Array(5).fill({
    name: '321',
    image: 'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=1611688293,2175392062&fm=26&gp=0.jpg',
  }));

export default withRouter(SearchH5Page);
