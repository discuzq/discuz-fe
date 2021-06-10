import React from 'react';
import Thread from '@components/thread';
import styles from './index.module.scss';

class UserCenterThreads extends React.Component {
  render() {
    return (
      <div className={styles.threadsContainer}>
        {this.props.data.map((itemInfo, index) => (
          <Thread data={itemInfo} className={index === 0 ? styles.threadBorder : ''} />
        ))}
      </div>
    );
  }
}

export default UserCenterThreads;
