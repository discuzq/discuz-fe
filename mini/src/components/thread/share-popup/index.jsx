import React from 'react';
import styles from './index.module.scss';
import Popup from '@discuzq/design/dist/components/popup/index';
import { noop } from '../utils';
import { View, Image } from '@tarojs/components'
import sharePointImg from '../../../../../web/public/dzq-img/sharePoint.png';
import shareKnowImg from '../../../../../web/public/dzq-img/shareKnow.png';
/**
 * 筛选分类组件
 * @prop {boolean} visible 是否分享弹框
 * @prop {function} onClose 弹框关闭事件
 */
const SharePopup = ({ visible = false, onClose = noop }) => {
  return (
    <Popup
      position="top"
      visible={visible}
      onClose={onClose}
    >
      <View className={styles.container}>
        <Image src={sharePointImg} className={styles.sharePoint} />
        <Image src={shareKnowImg} className={styles.shareKnow} onClick={onClose} />
      </View>
    </Popup>);
};

export default React.memo(SharePopup);
