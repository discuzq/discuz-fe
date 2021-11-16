import React from 'react';
import Thread from '@components/thread';
import styles from './index.module.scss';

class ThreadList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        {this.props.dataSource.map((itemInfo, index) => (
          <div key={index} className={index === 0 ? styles.threadFirstItem : styles.threadItem}>
            <Thread
              key={`${itemInfo.threadId}-${itemInfo.updatedAt}-${itemInfo.user.avatar}`}
              showBottomStyle={this.props.showBottomStyle}
              data={itemInfo}
              isHideBottomEvent
              isShowFissionData
              threadDetailUrl={`my/thread-data`}
            />
          </div>
        ))}
      </div>
    );
  }
}

export default ThreadList;
