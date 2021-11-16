import React from 'react';
import { inject, observer } from 'mobx-react';
import DataStatisticsCards from '@components/data-statistics-cards';
import SectionTitle from '@components/section-title';
import styles from './index.module.scss';
import ThreadReadSource from '@components/thread-read-source';
import BaseLayout from '@components/base-layout';
import Header from '@components/header';
import Thread from '@components/thread';

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
          visible: true,
        },
      ],
    };
  }

  render() {
    const { dataStatistics } = this.state;
    const { thread: threadStore } = this.props;
    const { threadData } = threadStore || {}
    console.log('>>> this.props.thread', this.props.thread)

    return (
      <BaseLayout>
        {/* <Header /> */}
        <div className={styles.mobileLayout}>
          <div className={styles.dividerContainer}>
            <Thread
              data={threadData}
              isHideBottomEvent
              isShowFissionData
              stopViewPost
            />
          </div>
          <div className={styles.unit}>
            <div className={styles.dividerContainer}>
              <SectionTitle title="核心数据" isShowMore={false} />
              <div className={styles.dataSourceContainer}>
                <DataStatisticsCards dataSource={dataStatistics} rowCardCount={3} />
              </div>
              <ThreadReadSource/>
            </div>
          </div>

          <div className={styles.unit}>
            <div className={styles.dividerContainer}>
              <SectionTitle title="分享者列表" leftNum="每天10:00更新" isShowMore={false} />
            </div>
          </div>
        </div>
      </BaseLayout>
    );
  }
}

export default ThreadData;
