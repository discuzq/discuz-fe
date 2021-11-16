import React from 'react';
import { inject, observer } from 'mobx-react';
import { View, Text } from '@tarojs/components';
import DataStatisticsCards from '@components/data-statistics-cards';
import { Icon } from '@discuzq/design';
import Popover from '@components/popover';
import SectionTitle from '@components/section-title';
import ThreadList from '@components/user-center-create/thread-list';
import classNames from 'classnames';
import styles from './index.module.scss';
import { priceFormat } from '@common/utils/price-format';

class UserCenterCreate extends React.Component {
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
          visible: false,
        },
      ],
    };
  }

  renderPopver() {
    return (
      <View className={styles.popoverBox}>
        <Popover
          content={
            <View className={styles.popoverContent}>
              <View>
                <Text>统计到今日0:00</Text>
              </View>
              <View>
                <Text>分享者包括分享领红包和付费帖分享裂变活动</Text>
              </View>
              <View>
                <Text>裂变率仅计算分享领红包活动</Text>
              </View>
            </View>
          }
        >
          <Text className={styles.popoverText}>数据统计</Text>
          <Icon name="EyeOutlined" color="#8490A8"></Icon>
        </Popover>
      </View>
    );
  }

  render() {
    const { dataStatistics } = this.state;
    return (
      <View>
        <View className={classNames(styles.dividerContainer, styles.dividerBottom)}>
          {this.renderPopver()}
          <DataStatisticsCards dataSource={dataStatistics} rowCardCount={3} />
        </View>
        <View>
          <View className={styles.threadHeader}>
            <SectionTitle title="我的创作" isShowMore={false} />
          </View>
          <ThreadList dataSource={this.props.threads}/>
        </View>
      </View>
    );
  }
}

export default UserCenterCreate;
