import React from 'react';
import { inject, observer } from 'mobx-react';
import ThreadContent from '@components/thread';
import BaseLayout from '@components/base-layout';

@inject('site')
@inject('index')
@observer
class Index extends React.Component {
  render() {
    const { index } = this.props;

    const { lists } = index;

    const likeThreadList = index.getList({ namespace: 'like' });

    const totalPage = index.getAttribute({
      namespace: 'like',
      key: 'totalPage',
    });

    const currentPage = index.getAttribute({
      namespace: 'like',
      key: 'currentPage',
    });

    const requestError = index.getListRequestError({ namespace: 'like' });

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
