import React from 'react';
import { Icon } from '@discuzq/design';
import styles from '../index.module.scss';

export default class CustomApplyPost extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { renderData, deletePlugin, _pluginInfo } = this.props;
    if (!renderData) return null;
    if (renderData && renderData?.tomId === _pluginInfo.options.tomId) {
      const { body } = renderData || {};
      const { activityStartTime } = body || {};
      if (!activityStartTime) return null;
    }
    return (
      <div className={styles['dzqp-post-widget']}>
        <div className={styles['dzqp-post-widget__right']}>
          <Icon className={styles['dzqp-post-widget__icon']} name='ApplyOutlined' />
          <span className={styles['dzqp-post-widget__text']}>活动报名</span>
        </div>
        <Icon
          className={styles['dzqp-post-widget__left']}
          name='DeleteOutlined'
          onClick={() => deletePlugin()}
        />
      </div>
    );
  }
}
