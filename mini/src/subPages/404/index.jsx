import React, { Component } from 'react';
import Router from '@discuzq/sdk/dist/router'
import { View, Text, Image } from '@tarojs/components';
import Button from '@discuzq/design/dist/components/button/index';
import Page from '@components/page';
import styles from './index.module.scss';
import img404 from '../../../../web/public/dzq-img/404.png';
import Taro from '@tarojs/taro';

class NotFindPage extends Component {
  componentWillMount() { }

  componentDidMount() { }

  componentWillUnmount() { }

  componentDidShow() { }

  componentDidHide() { }

  goback() {
    const pages = Taro.getCurrentPages();
    if (pages.length === 1) {
      Router.redirect({
        url: '/subPages/home/index'
      });
    } else {
      Router.back()
    }
  }

  render() {
    return (
      <Page>
        <View className={styles.page}>
          <Image className={styles.img} src={img404}/>
          <Text className={styles.text}>您要访问的页面可能已被删除、已更改名称或暂时不可用</Text>
          <View className={styles.fixedBox}>
            <Button onClick={() => {this.goback()}} size='large' className={styles.btn} type='primary'>返回上一页</Button>
          </View>
        </View>
      </Page>
    );
  }
}

export default NotFindPage;
