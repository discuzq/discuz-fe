import React, { Component } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Page from '@components/page';
import styles from './index.module.scss';
// import imgError from '../../../../web/public/dzq-img/error.png';

class SiteError extends Component {
  componentWillMount() { }

  componentDidMount() { }

  componentWillUnmount() { }

  componentDidShow() { }

  componentDidHide() { }

  render() {
    return (
      <Page>
        <View className={styles.page}>
          <Image className={styles.img} src='https://imgcache.qq.com/operation/dianshi/other/error.6332cffff6f7fcc0a193a12a7eb74cab05332bba.png'/>
          <Text className={styles.text}>站点未安装</Text>
        </View>
      </Page>
    );
  }
}

export default SiteError;
