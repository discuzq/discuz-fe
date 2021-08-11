import React from 'react';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';
import { withRouter } from 'next/router';
import BaseLayout from '@components/base-layout';
import h5Share from '@discuzq/sdk/dist/common_modules/share/h5';
import goToLoginPage from '@common/utils/go-to-login-page';
import NoData from '@components/no-data';
import SectionTitle from '@components/section-title';
import DetailsHeader from './components/details-header';
import ThreadContent from '@components/thread';
import Copyright from '@components/copyright';
import { Toast } from '@discuzq/design';
import ActiveUsers from '@components/active-users';
import BottomView from '@components/list/BottomView';

@inject('site')
@inject('user')
@inject('topic')
@observer
class IndexPCPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      refreshing: false,
    };
  }
  onSearch = (value) => {
    this.setState({ keyword: value }, () => {
      // this.searchData(value);
    });
  }

  // 分享
  onShare = (e) => {
    e.stopPropagation();

    // 对没有登录的先登录
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    Toast.info({ content: '复制链接成功' });

    const { content = '', topicId = '' } = this.props.topic?.topicDetail?.pageData[0] || {};
    h5Share({ title: content, path: `/topic/topic-detail/${topicId}` });
  }

   // 右侧 - 活跃用户 版权信息
   renderRight = () => (
      <>
      <ActiveUsers className="topic-detail-activeuser" />
      <Copyright/>
      </>
   )

  renderItem = ({ content = '', threadCount = 0, viewCount = 0, threads = [] }, index) => (
      <div className={styles.topicContent} key={index}>
        <DetailsHeader title={content} viewNum={viewCount} contentNum={threadCount} onShare={this.onShare} />
        <div className={styles.themeContent}>
          {
            threads?.length
              ? (
                threads?.map((item, index) => (
                  <ThreadContent data={item} key={index} className={styles.item} />
                ))
              )
              : <NoData />
          }
        </div>
      </div>
  )

  render() {
    const { pageData = [] } = this.props.topic?.topicDetail || {};
    const { isError, errorText, fetchTopicInfoLoading = true } = this.props;
    return (
    // <List className={styles.topicWrap}>

        <BaseLayout
          onSearch={this.onSearch}
          right={ this.renderRight }
          showRefresh={false}
          className="topic-detail-page"
          pageName="topic-detail"
        >
          {
          fetchTopicInfoLoading ? (
            <BottomView loadingText='加载中...' isError={isError} errorText={errorText} />
          )
            : (
              pageData?.map((item, index) => (
                this.renderItem(item, index)))
            )
        }
        </BaseLayout>
    // </List>
    );
  }
}
export default withRouter(IndexPCPage);
