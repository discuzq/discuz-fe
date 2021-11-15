import React from 'react';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';

class UserCenterShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        <span>分享中心</span>
      </div>
    );
  }
}

export default UserCenterShare;
