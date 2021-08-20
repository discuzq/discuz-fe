import React, { useState } from 'react';
import style from './index.module.scss';
import { View, Image } from '@tarojs/components'
import upImg from '../../public/dzq-img/up.png'
import bottomImg from '../../public/dzq-img/bottom.gif'

const Index = ({ onClose, money = '0.00' }) => {
  const buttonStyle = { transform: 'rotateY(360deg)', visibility: 'hidden' };
  const openStyle = { visibility: 'hidden' };
  const bottomStyle = { visibility: 'visible', transform: 'scale(1.5, 1.5)', opacity: '0' }
  const upStyle = { visibility: 'visible', opacity: '0' }
  const moneyTextStyle = { opacity: '1' }

  const [start, setStart] = useState(false)
  const handleClick = () => {
    setStart(true)
  };
  const handleClose = () => {
    if (typeof onClose === 'function') {
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
        <Image src={upImg} style={start ? bottomStyle : {}} className={style.animationUp} />
        <Image src={bottomImg} style={start ? upStyle : {}} className={style.animationBottom} />
      </View>
    </View>);
};
export default Index;
