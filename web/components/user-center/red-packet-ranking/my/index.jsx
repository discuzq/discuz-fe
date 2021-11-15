import React from 'react';
import ThreadList from '../components/thread-list'
import styles from './index.module.scss';


function MyList(props) {
  return (
    <ThreadList {...props}/>
  );
}

export default MyList;
