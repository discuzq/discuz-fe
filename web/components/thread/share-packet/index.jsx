import React, { useState } from 'react';
import styles from './index.module.scss';
import { Button, Tabs } from '@discuzq/design';
import { noop } from '../utils';
import Cash from './cash';
import Friend from './friend';
import Rank from './Rank';


/**
 * 分享红包详情内容
 * @prop {boolean} visible 是否分享弹框
 */
const sharePacket = ({ visible = false, onClose = noop, type = '' }) => {
  const [current, setCurrent] = useState(1);
  return (
    <div className={styles.root}>
      <div className={styles.top}>
            <div className={styles.guafen}>
                一起瓜分 <span>1000</span> 元
            </div>
            <div className={styles.yiqiang}>
                已抢 <span>0.55</span> 元
            </div>
            <img className={styles.avatar} src="https://discuz-service-test-1258344699.cos.ap-guangzhou.myqcloud.com/public/avatar/000/00/07/28.png?sign=q-sign-algorithm%3Dsha1%26q-ak%3DAKIDCJAnwjKjthEk6HBm6fwzhCLFRRBlsBxG%26q-sign-time%3D1636709220%3B1636795680%26q-key-time%3D1636709220%3B1636795680%26q-header-list%3Dhost%26q-url-param-list%3D%26q-signature%3D86e544895ef1d96c42c399907ca169711d3d6bf0&&imageMogr2/format/webp/quality/25/interlace/1/ignore-error/1" />
            <div className={styles.yifen}>你已瓜分1次，还剩2次瓜分机会</div>
            <div className={styles.zaiyao}>再邀请10位好友查看帖子，即可瓜分现金</div>
            <div className={styles.shareBtn}><Button type="primary"> 立即分享 </Button></div>
      </div>
      <div className={styles.bottom}>
          <Tabs
            activeId={current}
            onActive={id=>setCurrent(id)}
          >
                <Tabs.TabPanel label="活动规则" id={1}>
                <div className={styles.rule}>
                    每邀请3人，即可瓜分现金红包，邀请越多，瓜分越多！<br/>
                    每人最多可参与3次
                </div>
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

      </div>

    </div>
  );
};

export default (sharePacket);
