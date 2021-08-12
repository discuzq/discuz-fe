import React from 'react';
import { inject, observer } from 'mobx-react';
import IndexH5Page from '@layout/topic/topic-detail/h5';
import IndexPCPage from '@layout/topic/topic-detail/pc';
import { readTopicsList } from '@server';
import { Toast } from '@discuzq/design';
import ViewAdapter from '@components/view-adapter';

import HOCFetchSiteData from '@middleware/HOCFetchSiteData';

@inject('site')
@inject('topic')
@inject('baselayout')
@observer
class Index extends React.Component {
  page = 1;
  perPage = 10;

  static async getInitialProps(ctx) {
    const id = ctx?.query?.id;
    const topicFilter = {
      topicId: id,
      hot: 0,
    };
    const result = await readTopicsList({ params: { filter: topicFilter } });

    return {
      serverTopic: {
        topicDetail: result?.data,
      },
    };
  }

  constructor(props) {
    super(props);
    const { serverTopic, topic } = this.props;
    // 初始化数据到store中
    serverTopic && serverTopic.topicDetail && topic.setTopicDetail(serverTopic.topicDetail);
    this.state = {
      fetchTopicInfoLoading: false,
      isError: false,
      errorText: '加载失败',
    };
  }

  async componentDidMount() {
    const { topic, router } = this.props;
    const { id = '' } = router.query;
    const topicId = topic?.topicDetail?.pageData[0]?.topicId || '';
    // 当服务器无法获取数据时，触发浏览器渲染
    const hasTopics = !!topic.topicDetail;
    if (!hasTopics || Number(id) !== topicId) {
      this.setState({
        fetchTopicInfoLoading: true,
      });
      this.props.baselayout['topic-detail'] = -1;
      try {
        await topic.getTopicsDetail({ topicId: id });
        this.setState({
          fetchTopicInfoLoading: false,
        });
      } catch (errMsg) {
        this.setState({
          isError: true,
          errorText: errMsg,
        });
      }
    }
  }
  render() {
    return <ViewAdapter
            h5={
              <IndexH5Page
                dispatch={this.dispatch}
                fetchTopicInfoLoading={this.state.fetchTopicInfoLoading}
                isError={this.state.isError}
                errorText={this.state.errorText}
              />
            }

            pc={
              <IndexPCPage
                dispatch={this.dispatch}
                fetchTopicInfoLoading={this.state.fetchTopicInfoLoading}
                isError={this.state.isError}
                errorText={this.state.errorText}/>}
                title='话题详情'
              />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(Index);
