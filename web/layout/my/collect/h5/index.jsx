import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import Header from '@components/header';
import List from '@components/list';
import NoData from '@components/no-data';
import ThreadContent from '@components/thread';
import { Spin, Toast } from '@discuzq/design';
import styles from './index.module.scss';
import classnames from 'classnames';

@inject('site')
@inject('index')
@inject('thread')
@observer
class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      height: '100%',
    };
  }

  componentDidMount() {
    this.setState({
      // header 是 40px，留出 2px ，用以触发下拉事件
      height: window.outerHeight - 94,
    });
  }

  handleUnFavoriteItem = async (item) => {
    const { index } = this.props;
    const { pageData = [] } = index.threads || {};
    const params = {
      id: item.threadId,
      isFavorite: false,
    };
    const favoriteResp = await this.props.thread.updateFavorite(params);
    if (favoriteResp.success === false) {
      Toast.error({
        content: favoriteResp.msg || '取消收藏失败',
        duration: 2000,
      });
    } else {
      Toast.success({
        content: '取消收藏成功',
        duration: 2000,
      });
      pageData.splice(pageData.indexOf(item), 1);
      this.props.index.setThreads({ pageData: [...pageData] });
    }
  };

  render() {
    const { index, page, totalPage } = this.props;
    const { pageData = [] } = index.threads || {};

    return (
      <div className={styles.collectBox}>
        <Header />
        {pageData?.length !== 0 && <div className={styles.titleBox}>{`${this.props.totalCount} 条收藏`}</div>}
        <List
          height={this.state.height}
          className={classnames(styles.list, {
            [styles.noDataList]: this.props.firstLoading,
          })}
          immediateCheck={false}
          onRefresh={this.props.dispatch}
          noMore={page > totalPage}
        >
          <div className={styles.collectSplitLine} />
          {pageData?.map((item, index) => (
            <div className={styles.listItem} key={index}>
              <ThreadContent
                data={item}
                isShowIcon
                onClickIcon={async () => {
                  this.handleUnFavoriteItem(item);
                }}
              />
            </div>
          ))}
        </List>
      </div>
    );
  }
}

export default withRouter(Index);
