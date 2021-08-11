import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import ThreadContent from '@components/thread';
import BaseLayout from '@components/base-layout';
import styles from './index.module.scss';

@inject('site')
@inject('index')
@observer
class Index extends React.Component {
  render() {
    const { index } = this.props;
    const { pageData = [], currentPage, totalPage, totalCount } = index.threads || {};
    return (
      <BaseLayout
        requestError={this.props.index.threadError.isError}
        errorText={this.props.index.threadError.errorText}
        pageName={'buy'}
        showHeader={true}
        noMore={currentPage >= totalPage}
        onRefresh={this.props.dispatch}
      >
        {pageData?.length !== 0 && (
          <div className={styles.titleBox}>
            <span className={styles.num}>{`${totalCount || 0}`}</span>
            条购买
          </div>
        )}
        {pageData?.map((item, index) => (
          <ThreadContent key={index} data={item} />
        ))}
      </BaseLayout>
    );
  }
}

export default withRouter(Index);
