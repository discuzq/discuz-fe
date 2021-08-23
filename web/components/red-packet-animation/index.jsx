import React, { useState } from 'react';
import style from './index.module.scss';
import classNames from 'classnames';

const Index = ({ onClose = () => {}, money = '0.00' }) => {
  const [start, setStart] = useState(false);
  const handleClick = () => {
    const button = document.querySelector('#button');
    button.style = 'transform: rotateY(360deg); visibility: hidden';
    const open = document.querySelector('#open');
    open.style.visibility = 'hidden';
    const moneyText = document.querySelector('#moneyText');
    moneyText.style = 'opacity: 1';
    setStart(true);
  };
  const handleClose = () => {
    if (typeof onClose === 'function' && start) {
      onClose();
    }
  };
  return (
    <div className={style.masking} onClick={e => handleClose(e)}>
        <div className={style.container}>
            <div className={style.moneyText} id='moneyText'>
                <div className={style.text}>恭喜您，领到了</div>
                <div className={style.money}>{money}元</div>
            </div>
            <div className={style.button} id='button' onClick={handleClick}>
                <div className={style.open} id='open'>开</div>
            </div>
            <img src="/dzq-img/up.png" id='up' className={classNames(
              style.up,
              {
                [style.animationUp]: start,
              },
            )}/>
            <img src="/dzq-img/bottom.gif" id='bottom' className={classNames(
              style.bottom,
              {
                [style.animationBottom]: start,
              },
            )}/>
        </div>
        <div className={style.button} id='button' onClick={handleClick}>
          <div className={style.open} id='open'>开</div>
        </div>
    </div>);
};
export default Index;
