import React from 'react';
import { View, Text } from '@tarojs/components';
import { PLUGIN_TOMID_CONFIG } from '@common/plugin/plugin-tomid-config';
import { Icon } from '@discuzq/design';
import classNames from 'classnames';
import styles from '../index.module.scss';

export default class CustomApplyPost extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { renderData, deletePlugin } = this.props;
    if (!renderData) return null;
    if (renderData && renderData?.tomId === PLUGIN_TOMID_CONFIG.apply) {
      const { body } = renderData || {};
      const { activityStartTime } = body || {};
      if (!activityStartTime) return null;
    }

    return (
      <View className={classNames(styles['dzqp-post-widget'], styles['dzqp-mini'])}>
        <View className={styles['dzqp-post-widget__right']}>
          <Icon className={styles['dzqp-post-widget__icon']} name='ApplyOutlined' />
          <Text className={styles['dzqp-post-widget__text']}>活动报名</Text>
        </View>
        <Icon
          className={styles['dzqp-post-widget__left']}
          name='DeleteOutlined'
          onClick={() => deletePlugin()}
        />
      </View>
    );
  }
}
