import React, { useState } from 'react';
import style from './index.module.scss';
import { View, Image } from '@tarojs/components'
import upImg from '../../public/dzq-img/up.png'
import bottomImg from '../../public/dzq-img/bottom.gif'
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
        <View className={style.container}>
            <View className={style.moneyText} style={start ? moneyTextStyle : {}}>
                <View className={style.text}>恭喜您，领到了</View>
                <View className={style.money}>{money}元</View>
            </View>
            <View className={style.button} style={start ? buttonStyle : {}} onClick={handleClick}>
                <View className={style.open} style={start ? openStyle : {}}>开</View>
            </View>
            <Image src={upImg} className={classNames(
              style.up,
              {
                [style.animationUp]: start,
              },
            )}/>
            <Image src={bottomImg} className={classNames(
              style.bottom,
              {
                [style.animationBottom]: start,
              },)}
              />
        </View>
    </View>);
};
export default Index;
