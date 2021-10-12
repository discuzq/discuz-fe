import React, { useState, useEffect } from 'react'
import { View, Button } from '@tarojs/components'
import styles from './index.module.scss'
import Card from './card';
import { saveToAlbum } from './utils'
import getConfig from './config/thread-card';
import { throttle } from '@common/utils/throttle-debounce.js';
import { inject, observer } from 'mobx-react';
import getSiteConfig from './config/site-card';
import getCommentConfig from './config/comment-card/index.js'

const Index = ({
  thread,
  miniCode,
  site,
  user,
  data,
  comment,
}) => {
  useEffect(() => {
    if(comment){
      console.log(getCommentConfig({ site, comment, miniCode, siteName }))
      getCommentConfig({ site, comment, miniCode, siteName }).then(
        config => {
          console.log(config,'config')
          setConfig(config);
        }
      )
    }else if(thread) {
      getConfig({ site, thread, miniCode, siteName }).then(
        config => {
          setConfig(config);
        }
      )
    } else {
      getSiteConfig({ data, miniCode, siteName, user }).then(
        config => {
          setConfig(config)
        }
      )
    }
  }, [miniCode])
  const [config, setConfig] = useState('')
  const [shareImage, setShareImage] = useState('')
  const {siteName} = site.webConfig?.setSite || ''
  return (
    <View className={styles.container}>
      <Card config={config} setShareImage={setShareImage} miniCode={miniCode}></Card>
      <View className={`${styles.shareBtn}`}>
        <Button className={styles.btn} onClick={throttle(saveToAlbum(shareImage), 500)}>保存到相册</Button>
      </View>
    </View>)
}
export default inject('index', 'site', 'user')(observer(Index));