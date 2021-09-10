import React from 'react';
import { inject, observer } from 'mobx-react';
import ThreadContent from '@components/thread';
import BaseLayout from '@components/base-layout';

@inject('site')
@inject('threadList')
@observer
class Index extends React.Component {
  render() {
    const { threadList } = this.props;

    const { lists } = threadList;

    const likeThreadList = threadList.getList({ namespace: 'like' });

    const totalPage = threadList.getAttribute({
      namespace: 'like',
      key: 'totalPage',
    });

    const currentPage = threadList.getAttribute({
      namespace: 'like',
      key: 'currentPage',
    });

    const requestError = threadList.getListRequestError({ namespace: 'like' });

    return (
      <BaseLayout
        showHeader={false}
        noMore={currentPage >= totalPage}
        onRefresh={this.props.dispatch}
        showLoadingInCenter={!likeThreadList?.length}
        requestError={requestError.isError}
        errorText={requestError.errorText}
      >
        {likeThreadList?.map((item, index) => (
          <ThreadContent key={index} data={item} />
        ))}
      </BaseLayout>
    );
  }
}

export default Index;
