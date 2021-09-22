import React, { useState } from 'react';
import Button from '@discuzq/design/dist/components/button';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
// import error from '../../public/dzq-img/error.png';
const error = 'https://imgcache.qq.com/operation/dianshi/other/error.6332cffff6f7fcc0a193a12a7eb74cab05332bba.png';

export default function ErrorPage(props) {
  const [text] = useState(props.text || '服务器错误 SERVER ERROR');

  const onReflush = () => {
    Taro.navigateBack({
      delta: 1,
    });
  };

  return (
    <View className={styles.page}>
        <Image className={styles.icon} src={error} />
        <Text className={styles.text}>{text}</Text>

      <View className={styles.footer}>
        <Button onClick={onReflush} className={styles.button} type="primary" size='large'>
          返回上一页
        </Button>
      </View>
    </View>
  );
}
