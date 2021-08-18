import React from 'react';
import style from './index.module.scss';
const Index = ({ onClose, money = '0.00' }) => {
  const handleClick = () => {
    const button = document.querySelector('#button');
    button.style = 'transform: rotateY(360deg); visibility: hidden';
    const open = document.querySelector('#open');
    open.style.visibility = 'hidden';
    const bottom = document.querySelector('#bottom');
    bottom.style = 'visibility: visible; transform: scale(1.5, 1.5); opacity: 0;';
    const up = document.querySelector('#up');
    up.style = 'visibility: visible;  opacity: 0;';
    const moneyText = document.querySelector('#moneyText');
    moneyText.style = 'opacity: 1';
  };
  return (
    <div className={style.masking}>
        <div className={style.container}>
            <div className={style.moneyText} id='moneyText'>
                <div className={style.text}>恭喜您，领到了</div>
                <div className={style.money}>{money}元</div>
            </div>
            <div className={style.button} id='button' onClick={handleClick}>
                <div className={style.open} id='open'>开</div>
            </div>
            <img src="/dzq-img/up.png" id='bottom' className={style.animationUp}/>
            <img src="/dzq-img/bottom.gif" id='up' className={style.animationBottom}/>
        </div>
    </div>);
};
export default Index;
