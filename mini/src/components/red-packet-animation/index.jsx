import React, { useState } from 'react';
import style from './index.module.scss';
import { View, Image } from '@tarojs/components'
import classNames from 'classnames';

const Index = ({ onClose, money = '0.00' }) => {
const buttonStyle = {transform: 'rotateY(360deg)', visibility: 'hidden'};
const openStyle = {visibility: 'hidden'};
const moneyTextStyle = {opacity: '1'}

  const [start, setStart] = useState(false)
  const handleClick = () => {
    setStart(true)
};
const handleClose = () => {
    if (typeof onClose === 'function' && start) {
        onClose()
    }
  }
  return (
    <View className={style.masking} onClick={handleClose}>
        <View className={style.container} onClick={e => e.stopPropagation()}>
            <View className={style.moneyText} style={start ? moneyTextStyle : {}}>
                <View className={style.text}>恭喜您，领到了</View>
                <View className={style.money}>{money}元</View>
            </View>
            <View className={style.button} style={start ? buttonStyle : {}} onClick={handleClick}>
                <View className={style.open} style={start ? openStyle : {}}>开</View>
            </View>
            <Image src="https://imgcache.qq.com/operation/dianshi/other/up.01d1a47e41389411f01d143867134d93e0678512.png" className={classNames(
              style.up,
              {
                [style.animationUp]: start,
              },
            )}/>
            <Image src="https://imgcache.qq.com/operation/dianshi/other/bottom.5e276e5e63dc355cea9ad803dbc2bc6169acc0ed.gif" className={classNames(
              style.bottom,
              {
                [style.animationBottom]: start,
              },)}
              />
        </View>
    </View>);
};
export default Index;
