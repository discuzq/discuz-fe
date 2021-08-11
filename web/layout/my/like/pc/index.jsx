import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import styles from './index.module.scss';
import BaseLayout from '@components/base-layout';
import ThreadContent from '@components/thread';
import Copyright from '@components/copyright';
import SidebarPanel from '@components/sidebar-panel';
import PopTopic from '@components/pop-topic';
import UserCenterFansPc from '@components/user-center/fans-pc';

@inject('site')
@inject('index')
@inject('search')
@observer
class LikePCPage extends React.Component {
  constructor(props) {
    super(props);
  }

  redirectToSearchResultTopic = () => {
    this.props.router.push('/search/result-topic');
  };

  fetchMoreData = () => {
    const { dispatch } = this.props;
    return dispatch('moreData');
  };
  // 右侧 - 潮流话题 粉丝 版权信息
  renderRight = () => {
    const { pageData = [] } = this.props.search.topics || { pageData: [] };
    return (
      <>
        <PopTopic />
        <Copyright/>
      </>
    );
  }
  render() {
    const { index, site } = this.props;
    const { threads } = index;
    const { pageData, currentPage, totalPage, totalCount = 0 } = threads || {};
    return (
      <BaseLayout
        right={ this.renderRight }
        noMore={currentPage >= totalPage}
        showRefresh={false}
        onRefresh={this.fetchMoreData}
        rightClass={styles.rightSide}
        isShowLayoutRefresh={!!pageData?.length}
        className="mylike"
      >
        <SidebarPanel
          title="我的点赞"
          type='normal'
          isShowMore={false}
          noData={!pageData?.length}
          isLoading={!pageData}
          icon={{ type: 3, name: 'LikeOutlined' }}
          rightText={`共有${totalCount}条点赞`}
          className={styles.container}
          mold='plane'
          isError={this.props.index.threadError.isError}
          errorText={this.props.index.threadError.errorText}
        >
          {
            pageData?.map((item, index) => <ThreadContent className={styles.threadContent} data={item} key={index} />)
          }
        </SidebarPanel>
      </BaseLayout>
    );
  }
}

export default withRouter(LikePCPage);
