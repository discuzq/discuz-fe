import React, { useState } from 'react';
import { Button, Tabs } from '@discuzq/design';
import { View, Image } from '@tarojs/components'
import { noop } from '../utils';
import Cash from './cash';
import Friend from './friend';
import Rank from './Rank';
import styles from './index.module.scss';


/**
 * 分享红包详情内容
 * @prop {boolean} visible 是否分享弹框
 */
const sharePacket = ({ visible = false, onClose = noop, type = '' }) => {
  const [current, setCurrent] = useState(1);
  return (
    <View className={styles.root}>
      <View className={styles.top}>
            <View className={styles.guafen}>
                一起瓜分 <View className={styles.red}>1000</View> 元
            </View>
            <View className={styles.yiqiang}>
                已抢 <View className={styles.red}>0.55</View> 元
            </View>
            <Image className={styles.avatar} src="https://discuz-service-test-1258344699.cos.ap-guangzhou.myqcloud.com/public/avatar/000/00/07/41.png?sign=q-sign-algorithm%3Dsha1%26q-ak%3DAKIDCJAnwjKjthEk6HBm6fwzhCLFRRBlsBxG%26q-sign-time%3D1636981358%3B1637067817%26q-key-time%3D1636981358%3B1637067817%26q-header-list%3Dhost%26q-url-param-list%3D%26q-signature%3Dcea3b50fcb9be2b2941a0fd86c14f8001d4954d0&&imageMogr2/format/jpg/quality/15/interlace/1/ignore-error/1" />
            <View className={styles.yifen}>你已瓜分1次，还剩2次瓜分机会</View>
            <View className={styles.zaiyao}>再邀请10位好友查看帖子，即可瓜分现金</View>
            <View className={styles.shareBtn}><Button type="primary"> 立即分享 </Button></View>
      </View>
      <View className={styles.bottom}>
          <Tabs
            activeId={current}
            onActive={id=>setCurrent(id)}
          >
                <Tabs.TabPanel label="活动规则" id={1}>
                <View className={styles.rule}>
                    每邀请3人，即可瓜分现金红包，邀请越多，瓜分越多！
                    每人最多可参与3次
                </View>
                </Tabs.TabPanel>
                <Tabs.TabPanel label="现金记录" id={2}>
                    <Cash></Cash>
                </Tabs.TabPanel>
                <Tabs.TabPanel label="我的好友" id={3}>
                    <Friend></Friend>
                </Tabs.TabPanel>
                <Tabs.TabPanel label="排行榜" id={4}>
                    <Rank></Rank>
                </Tabs.TabPanel>
          </Tabs>

      </View>

    </View>
  );
};

export default (sharePacket);
