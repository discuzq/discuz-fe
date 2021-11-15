import React from 'react';
import { inject, observer } from 'mobx-react';
import ThreadList from '../components/thread-list'
import styles from './index.module.scss';

function HotList(props) {
  return (
    <ThreadList {...props}/>
  );
}

export default inject('user')(observer(HotList));
