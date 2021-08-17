import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import styles from './index.module.scss';
import BaseLayout from '@components/base-layout';
import NoData from '@components/no-data';
import DetailsHeader from './components/details-header';
import ThreadContent from '@components/thread';
import h5Share from '@discuzq/sdk/dist/common_modules/share/h5';
import goToLoginPage from '@common/utils/go-to-login-page';
import { Toast } from '@discuzq/design';
import BottomView from '@components/list/BottomView';

@inject('site')
@inject('user')
@inject('topic')
@observer
class TopicH5Page extends React.Component {
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

  renderItem = ({ content = '', threadCount = 0, viewCount = 0, threads = [] }, index) => (
      <div key={index}>
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
    const { pageData } = this.props.topic?.topicDetail || {};
    const { isError, errorText, fetchTopicInfoLoading = true } = this.props;
    return (
      <BaseLayout allowRefresh={false} pageName="topicDetail">
        {
          fetchTopicInfoLoading ? (
            <BottomView loadingText='加载中...' className={styles.bottomViewBox} isError={isError} errorText={errorText} />
          )
            : (
              pageData?.map((item, index) => (
                this.renderItem(item, index)))
            )
        }
      </BaseLayout>
    );
  }
}
export default withRouter(TopicH5Page);
