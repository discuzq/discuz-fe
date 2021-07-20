import React from 'react';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';
import Header from '@components/header';
import {Button} from '@discuzq/design';
import Router from '@discuzq/sdk/dist/router';
import { ERROR_PAGE_TIPS } from '@common/constants/site';

@inject('site')
@observer
class H5500Page extends React.Component {
  render() {
    const { site: { errPageType = '' } } = this.props;
    return (
      <div className={styles.page}>
        <Header/>
        <img className={styles.img} src='/dzq-img/error.png'/>
        <p className={styles.text}>{ (errPageType && ERROR_PAGE_TIPS[errPageType]) || '未知错误'}</p>
        <div className={styles.fixedBox}>
          <Button onClick={() => {Router.redirect({url: '/'});}} size='large' className={styles.btn} type='primary'>回到首页</Button>
        </div>
      </div>
    );
  }
}


export default H5500Page;
