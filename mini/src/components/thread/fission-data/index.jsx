import React from 'react';
import { View, Text } from '@tarojs/components';
import { Icon } from '@discuzq/design';
import styles from './index.module.scss';
import { priceFormat } from '@common/utils/price-format';

class ThreadFissionData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      statisticsConfig: [
        {
          name: '阅读者',
          field: 'totalReaderNumber',
          suffix: '人',
          icon: 'PersonalOutlined'
        },
        {
          name: '分享者',
          field: 'totalSharerNumber',
          suffix: '人',
          icon: 'ShareAltOutlined'
        },
        {
          name: '裂变率',
          field: 'fissionRate',
          suffix: '人',
          icon: 'FissionOutlined'
        },
        {
          name: '发出红包',
          field: 'totalThreadFissionMoney',
          suffix: '元',
          icon: 'RedPacketOutlined'
        },
        {
          name: '解锁内容',
          field: 'UnlockOutlined',
          suffix: '人',
          icon: 'PoweroffOutlined'
        },

      ]
    };
  }

  render() {
    const { statisticsConfig } = this.state
    // TODO 有数据后替换帖子内容
    // const { thread } = this.props
    const thread = {
      totalReaderNumber: 0, // 总阅读者
      totalSharerNumber: 55, // 总分享者
      totalThreadFissionMoney:55, // 分享裂变总金额-发出红包
      fissionRate: 50, // 裂变率
      // unlockContent: 30, // 解锁内容
    }
    const { onClick } = this.props
    return (
      <View className={styles.statisticsWrap} onClick={onClick}>
        {
          statisticsConfig.map((item, index) => {
            return (
              thread[item.field] !== 'undefined' && 
              <View className={styles.itemContent}>
                <Icon name={item.icon} color="#8490A8"/>
                <Text className={styles.value}>{item.field === 'totalThreadFissionMoney' ? priceFormat(thread[item.field]) : thread[item.field]}{item.suffix}</Text>
              </View> 
            )
          })
        }
      </View>
    );
  }
}

export default ThreadFissionData;
