import React from 'react';
import { inject, observer } from 'mobx-react';
import IndexH5Page from '@layout/search/result-post';
import Page from '@components/page';
import { getCurrentInstance } from '@tarojs/taro';
import withShare from '@common/utils/withShare/withShare'
@inject('search')
@inject('topic')
@inject('index')
@inject('user')
@observer
@withShare({
  needShareline: false
})
class Index extends React.Component {

  page = 1;
  perPage = 10;

  async componentDidMount() {
    const { search, router } = this.props;
    const { keyword = '' } = getCurrentInstance().router.params;
      this.page = 1;
      await search.getThreadList({ search: keyword });
  }
  getShareData (data) {
    const shareData = data.target?.dataset?.shareData
    if(data.from === 'menu') {
      return {
      }
    }
    const { title, path, comeFrom, threadId } = data
    if(comeFrom && comeFrom === 'thread') {
      const { user } = this.props
      this.props.index.updateThreadShare({ threadId }).then(result => {
      if (result.code === 0) {
          this.props.index.updateAssignThreadInfo(threadId, { updateType: 'share', updatedInfo: result.data, user: user.userInfo });
          this.props.search.updateAssignThreadInfo(threadId, { updateType: 'share', updatedInfo: result.data, user: user.userInfo });
          this.props.topic.updateAssignThreadInfo(threadId, { updateType: 'share', updatedInfo: result.data, user: user.userInfo });
      }
    });
    }
    return {
      title,
      path
    }
  }
  dispatch = async (type, data) => {
    const { search } = this.props;

    if (type === 'refresh') {
      this.page = 1;
      search.setThreads(null);
    } else if (type === 'moreData') {
      this.page += 1;
    }
    await search.getThreadList({ search: data, perPage: this.perPage, page: this.page });
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
export default Index;
