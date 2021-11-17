import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import Router from '@discuzq/sdk/dist/router';
import BaseLayout from '@components/base-layout';
import DataStatisticsCards from '@components/data-statistics-cards';
import { Icon } from '@discuzq/design';
import SectionTitle from '@components/section-title';
import styles from './index.module.scss';
import classnames from 'classnames';
import ThreadReadSource from '@components/thread-read-source';
import RenderRightPC from '@components/user-center/render-right-pc';
import Thread from '@components/thread';
@inject('user')
@inject('site')
@inject('thread')
@observer
class ThreadData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataStatistics: [
        {
          id: 'totalReaderNumber',
          label: '阅读者（人）',
          value: 155,
          visible: true,
        },
        {
          id: 'totalSharerNumber',
          label: '分享者（人）',
          value: 30,
          visible: true,
        },
        {
          id: 'totalThreadFissionMoney',
          label: '裂变率（%）',
          value: 50,
          visible: true,
        },
        {
          id: 'fissionRate',
          label: '发出红包（元）',
          value: 266,
          visible: true,
        },
        {
          id: 'unlockContentNumber',
          label: '解锁内容（人）',
          value: 168,
          visible: false,
        },
      ],
    };
  }

  HandleGoBack() {
    Router.push({url: '/my'})
  }

  renderRight() {
    const { user, site } = this.props;
    console.log('>> user', user)
    console.log('>> site', site)
    return <RenderRightPC user={user} site={site}/>
  }  

  render() {
    const { dataStatistics } = this.state;
    const { thread: threadStore } = this.props;
    const { threadData } = threadStore || {}
    
    return (
      <BaseLayout
        showRefresh={false}
        right={this.renderRight()}
      >
        <div className={classnames(styles.dividerContainer)}>
          <div className={styles.threadContainer}>
            <a className={styles.backBox} onClick={this.HandleGoBack} href="javascript:void(0)">
              <Icon name='ReturnOutlined' color="#8490A8"></Icon><span className={styles.backText}>返回</span>
            </a>
            <Thread
              data={threadData}
              isHideBottomEvent
              isShowFissionData
              stopViewPost
            />
          </div>
        </div>

        <div className={classnames(styles.unit, styles.dividerContainer)}>
          <div className={styles.sectionContainer}>
            <SectionTitle title="核心数据" isShowMore={false} />
            <div className={styles.dataSourceContainer}>
              <DataStatisticsCards dataSource={dataStatistics} rowCardCount={5} />
            </div>
            <ThreadReadSource/>
          </div>
        </div>

        <div className={classnames(styles.unit, styles.dividerContainer)}>
          <div className={styles.sectionContainer}>
            <SectionTitle title="分享者列表" leftNum="每天10:00更新" isShowMore={false} />
          </div>
        </div>
      </BaseLayout>
    );
  }
}

export default withRouter(ThreadData);
