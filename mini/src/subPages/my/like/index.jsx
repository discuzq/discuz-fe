import React from 'react';
import { inject, observer } from 'mobx-react';
import IndexH5Page from '../../../layout/my/like';
import Page from '@components/page';
import withShare from '@common/utils/withShare/withShare';
import { priceShare } from '@common/utils/priceShare';
import Taro from '@tarojs/taro';

@inject('site')
@inject('search')
@inject('topic')
@inject('index')
@inject('user')
@observer
@withShare({})
class Index extends React.Component {
  page = 1;
  perPage = 10;

  constructor(props) {
    super(props);
    this.props.index.registerList({ namespace: 'like' });
  }

  async componentDidMount() {
    Taro.hideShareMenu();
    const { index } = this.props;
    const threadsResp = await index.fetchList({
      namespace: 'like',
      perPage: 10,
      page: this.page,
      filter: {
        complex: 2,
      },
    });

    index.setList({
      namespace: 'like',
      data: threadsResp,
      page: this.page,
    });
  }

  componentWillUnmount() {
    this.props.index.setThreads(null);
  }

  dispatch = async () => {
    const { index } = this.props;

    this.page += 1;
    const threadsResp = await index.fetchList({
      namespace: 'like',
      perPage: this.perPage,
      page: this.page,
      filter: {
        complex: 2,
      },
    });

    index.setList({
      namespace: 'like',
      data: threadsResp,
      page: this.page,
    });
  };
  
  getShareData(data) {
    const { site } = this.props;
    const defalutTitle = site.webConfig?.setSite?.siteName || '';
    const defalutPath = '/subPages/my/like/index';
    if (data.from === 'menu') {
      return {
        title: defalutTitle,
        path: defalutPath,
      };
    }
    const { title, path, comeFrom, threadId, isAnonymous, isPrice } = data;
    if (comeFrom && comeFrom === 'thread') {
      const { user } = this.props;
      this.props.index.updateThreadShare({ threadId }).then((result) => {
        if (result.code === 0) {
          this.props.index.updateAssignThreadInfo(threadId, {
            updateType: 'share',
            updatedInfo: result.data,
            user: user.userInfo,
          });
          this.props.search.updateAssignThreadInfo(threadId, {
            updateType: 'share',
            updatedInfo: result.data,
            user: user.userInfo,
          });
          this.props.topic.updateAssignThreadInfo(threadId, {
            updateType: 'share',
            updatedInfo: result.data,
            user: user.userInfo,
          });
        }
      });
    }
    return (
      priceShare({ path, isPrice, isAnonymous }) || {
        title,
        path,
      }
    );
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
export default Index;
