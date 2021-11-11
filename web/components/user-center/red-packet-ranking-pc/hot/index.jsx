import React, { Component } from 'react';
import styles from './index.module.scss';
import { Spin, Input, Icon, Dialog, Toast, Button } from '@discuzq/design';
import { inject, observer } from 'mobx-react';
import { IMG_SRC_HOST } from '@common/constants/site';
import ThreadList from '../components/thread-list'

const redPacketIcon = `${IMG_SRC_HOST}/assets/redpacket-mini.10b46eefd630a5d5d322d6bbc07690ac4536ee2d.png`;

@inject('user')
@observer
export default class HotList extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  async componentDidMount() {
  }

  render() {
    return (
      <ThreadList/>
    );
  }
}
