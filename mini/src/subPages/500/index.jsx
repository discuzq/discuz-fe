import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Router from '@discuzq/sdk/dist/router'
import { View, Text, Image } from '@tarojs/components';
import Button from '@discuzq/design/dist/components/button/index';
import Page from '@components/page';
import { ERROR_PAGE_TIPS } from '@common/constants/site';
import styles from './index.module.scss';
import imgError from '../../../../web/public/dzq-img/error.png';

@inject('site')
@observer
class SiteError extends Component {
  componentWillMount() { }

  componentDidMount() { }

  componentWillUnmount() { }

  componentDidShow() { }

  componentDidHide() { }

  render() {
    const { site: { errPageType = '' } } = this.props;
    return (
      <Page>
      <View className={styles.page}>
        <Image className={styles.img} src={imgError}/>
        <Text className={styles.text}>{ (errPageType && ERROR_PAGE_TIPS[errPageType]) || '未知错误'}</Text>
        <View className={styles.fixedBox}>
          <Button onClick={() => {Router.redirect({url: '/indexPages/home/index'});}} size='large' className={styles.btn} type='primary'>回到首页</Button>
        </View>
      </View>
      </Page>
    );
  }
}

export default SiteError;
