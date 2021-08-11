import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import ThreadContent from '@components/thread';
import BaseLayout from '@components/base-layout';

@inject('site')
@inject('index')
@observer
class Index extends React.Component {
  render() {
    const { index } = this.props;
    const { pageData = [], currentPage, totalPage } = index.threads || {};

    return (
      <BaseLayout
        pageName={'like'}
        showHeader={true}
        noMore={currentPage >= totalPage}
        onRefresh={this.props.dispatch}
        requestError={this.props.index.threadError.isError}
        errorText={this.props.index.threadError.errorText}
      >
        {pageData?.map((item, index) => (
          <ThreadContent key={index} data={item} />
        ))}
      </BaseLayout>
    );
  }
}

export default withRouter(Index);
