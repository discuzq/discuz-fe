import React from 'react';
import { inject, observer } from 'mobx-react';
import { View, Text } from '@tarojs/components';
import DataStatisticsCards from '@components/data-statistics-cards';
import SectionTitle from '@components/section-title';
import ThreadReadSource from '@components/thread-read-source';
import Thread from '@components/thread';
import styles from './index.module.scss';
import { priceFormat } from '@common/utils/price-format';
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
          value: priceFormat(266),
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
 
    return (
      <View className={styles.mobileLayout}>
        <View>
          <View className={styles.dividerContainer}>
            <Thread
              data={threadData}
              isHideBottomEvent
              isShowFissionData
              stopViewPost
            />
          </View>
        </View>

        <View className={styles.unit}>
          <View className={styles.dividerContainer}>
            <SectionTitle title="核心数据" isShowMore={false} />
            <View className={styles.dataSourceContainer}>
              <DataStatisticsCards dataSource={dataStatistics} rowCardCount={3} />
            </View>
            <ThreadReadSource/>
          </View>
        </View>

        <View className={styles.unit}>
          <View className={styles.dividerContainer}>
            <SectionTitle title="分享者列表" leftNum="每天10:00更新" isShowMore={false} />
          </View>
        </View>
      </View>
    );
  }
}

export default ThreadData;
