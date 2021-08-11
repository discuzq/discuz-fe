import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import styles from './index.module.scss';
import BaseLayout from '@components/base-layout';
import ThreadContent from '@components/thread';
import Copyright from '@components/copyright';
import PopTopic from '@components/pop-topic';
import UserCenterFansPc from '@components/user-center/fans-pc';
import SidebarPanel from '@components/sidebar-panel';

@inject('site')
@inject('index')
@observer
class BuyPCPage extends React.Component {
  constructor(props) {
    super(props);
  }

  redirectToSearchResultPost = () => {
    this.props.router.push(`/search/result-post?keyword=${this.state.value || ''}`);
  };

  // 右侧 - 潮流话题 粉丝 版权信息
  renderRight = () => (
    <div className={styles.right}>
      <PopTopic />
      <Copyright />
    </div>
  );

  render() {
    const { index } = this.props;
    const { pageData, currentPage, totalPage   } = index.threads || {};

    return (
      <BaseLayout
        right={this.renderRight}
        noMore={currentPage >= totalPage}
        onRefresh={this.props.dispatch}
        showRefresh={false}
        rightClass={styles.rightSide}
        isShowLayoutRefresh={!!pageData?.length}
        className="mybuy"
      >
        <SidebarPanel
          title="我的购买"
          type='normal'
          isShowMore={false}
          noData={!pageData?.length}
          isLoading={!pageData}
          icon={{ type: 3, name: 'ShoppingCartOutlined' }}
          rightText={`共有${this.props.totalCount}条购买`}
          mold='plane'
          isError={this.props.index.threadError.isError}
          errorText={this.props.index.threadError.errorText}
        >
          {pageData?.map((item, index) => (
            <ThreadContent className={index === 0 && styles.threadStyle} data={item} key={index} />
          ))}
        </SidebarPanel>
      </BaseLayout>
    );
  }
}

export default withRouter(BuyPCPage);
