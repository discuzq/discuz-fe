import React, { useState } from 'react';
import { inject, observer } from 'mobx-react';
import ThreadList from '../components/thread-list'
import styles from './index.module.scss';

function MyList() {
  return (
    <ThreadList/>
  );
}

export default inject('user')(observer(MyList))
