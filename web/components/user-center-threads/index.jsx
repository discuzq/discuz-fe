import React from 'react';
import Thread from '@components/thread';
import styles from './index.module.scss';

class UserCenterThreads extends React.Component {
  render() {
    return (
      <div className={styles.threadsContainer}>
        {this.props.data.map((itemInfo, index, arr) => (
          <Thread
            key={`${itemInfo.threadId}-${itemInfo.updatedAt}-${itemInfo._time}`}
            data={itemInfo}
            showBottomStyle={index !== arr.length - 1}
          />
        ))}
      </div>
    );
  }
}

export default UserCenterThreads;
