import React, { Component } from 'react';
import styles from './index.module.scss';
import { Spin, Input, Icon, Dialog, Toast, Button } from '@discuzq/design';
import { inject, observer } from 'mobx-react';
import Avatar from '@components/avatar';
import { IMG_SRC_HOST } from '@common/constants/site';

const redPacketIcon = `${IMG_SRC_HOST}/assets/redpacket-mini.10b46eefd630a5d5d322d6bbc07690ac4536ee2d.png`;

@inject('user')
@observer
export default class AllList extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  async componentDidMount() {
  }

  render() {
    return (
      <div className={styles.wrap}>
        <div className={styles.header}>
          <div className={styles.ranking}>排名</div>
          <div className={styles.nickname}>用户昵称</div>
          <div className={styles.user__amount}>邀请用户数</div>
          <div className={styles.money}>获得赏金（元）</div>
        </div>
        <div className={styles.list}>
          <div className={styles.list__item}>
            <div className={styles.ranking}>1</div>
            <div className={styles.nickname}>
              <Avatar
                className={styles.avatar}
                name='用户名称...'
                circle={true}
                image='https://discuz-service-test-1258344699.cos.ap-guangzhou.myqcloud.com/public/avatar/000/00/09/29.png?sign=q-sign-algorithm%3Dsha1%26q-ak%3DAKIDCJAnwjKjthEk6HBm6fwzhCLFRRBlsBxG%26q-sign-time%3D1636600147%3B1636686607%26q-key-time%3D1636600147%3B1636686607%26q-header-list%3Dhost%26q-url-param-list%3D%26q-signature%3D3c902f16c370de9f70029868d08e5a4c5a13daec&&imageMogr2/format/webp/quality/40/interlace/1/ignore-error/1'
                onClick={() => {}}
              />
              <span>用户昵称</span>
            </div>
            <div className={styles.user__amount}>8</div>
            <div className={styles.money}>50.00</div>
          </div>
        </div>
      </div>
    );
  }
}
