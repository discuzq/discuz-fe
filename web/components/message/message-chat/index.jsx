import React, { memo, useEffect, useMemo, useState } from 'react';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';

import Header from '@components/header';
import InstantMessaging from '../instant-messaging';

const Index = ({ dialogId, site, message, user, username }) => {
  const { isPC } = site;

  const messageHeader = (
    <div className={styles['pc-header']}>
      <div className={styles['pc-header__inner']}>
        {username}
      </div>
    </div>
  );

  return (
    <div className={styles.wrapper}>
      {isPC ? messageHeader : <Header />}
      <InstantMessaging dialogId={dialogId} username={username} />
    </div>
  );
};

export default inject('message', 'user', 'site')(observer(Index));
