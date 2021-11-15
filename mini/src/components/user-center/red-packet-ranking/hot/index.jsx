import React from 'react';
import ThreadList from '../components/thread-list'
import styles from './index.module.scss';

function HotList(props) {
  return (
    <ThreadList {...props}/>
  );
}

export default HotList;