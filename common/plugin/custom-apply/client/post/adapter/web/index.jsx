import React from 'react';
import { Icon } from '@discuzq/design';
import { PLUGIN_TOMID_CONFIG } from '@common/plugin/plugin-tomid-config';
import styles from '../index.module.scss';

export default class CustomApplyPost extends React.Component {
  constructor(props) {
    super(props);
  }

  handleClick = () => {
    console.log('click');
    const { renderData, _pluginInfo, updatePlugin } = this.props;
    updatePlugin({ postData: renderData, _pluginInfo }, true);
  };

  render() {
    const { renderData, deletePlugin } = this.props;
    if (!renderData || renderData?.tomId !== PLUGIN_TOMID_CONFIG.apply) return null;
    if (renderData && renderData?.tomId === PLUGIN_TOMID_CONFIG.apply) {
      const { body } = renderData || {};
      const { activityStartTime } = body || {};
      if (!activityStartTime) return null;
    }

    return (
      <div className={styles['dzqp-post-widget']} onClick={e => e.stopPropagation()}>
        <div className={styles['dzqp-post-widget__right']} onClick={this.handleClick}>
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
