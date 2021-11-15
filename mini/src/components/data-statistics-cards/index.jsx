import React from 'react';
import { inject, observer } from 'mobx-react';
import { View, Text } from '@tarojs/components';
import classNames from 'classnames';

import styles from './index.module.scss';

class DataStatisticsCards extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderActionItems = (item) => {};

  render() {
    const { dataSource, rowCardCount } = this.props;
    const itemWidth = `${100 / rowCardCount}%`;
    return (
      <View className={classNames(styles.cardsBox)}>
        {dataSource.map((item, index) => {
          return (
            item.visible && (
              <View className={styles.cardItemBox} style={{ width: itemWidth }}>
                <Text className={styles.cardValue}>{item.value}</Text>
                <Text className={classNames(styles.cardLabel, (index + 1) % rowCardCount && styles.cardLabelBorder)}>
                  {item.label}
                </Text>
              </View>
            )
          );
        })}
      </View>
    );
  }
}

export default DataStatisticsCards;
