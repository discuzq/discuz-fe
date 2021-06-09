import React from 'react';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';
import Header from '@components/header';
import {Button} from '@discuzq/design';
import isServer from '@common/utils/is-server';
import Router from '@discuzq/sdk/dist/router';
import Copyright from '@components/copyright';

@observer
class PC500Page extends React.Component {
  constructor(props) {
    super(props);
    this.goBackClickHandle = this.goBackClickHandle.bind(this);
  }
  goBackClickHandle() {
      window.history.length <= 1 ? Router.redirect({ url: '/' }) : Router.back();
  }
  render() {
    const height = isServer() ? '100vh' : `${window.innerHeight - 160}px`;
    return (
      <div className={styles.body}>
        <Header/>
        <div className={styles.page} style={{height: height}}>
          <img className={styles.img} src='/dzq-img/error.png'/>
          <p className={styles.text}>服务器错误 SERVER ERROR</p>
          <Button onClick={this.goBackClickHandle} size='large' className={styles.btn} type='primary'>回到首页</Button>
        </div>
        <Copyright center line/>
      </div>
      
    );
  }
}


export default PC500Page;
