import React, { useContext } from 'react';
import { Button, Icon } from '@discuzq/design';
import Avatar from '../../avatar';
import { noop } from '../utils';
import styles from './index.module.scss';
import { ThreadCommonContext } from '../utils'

/**
 * 用户信息视图
 * @prop {string}  imgSrc 用户头像
 * @prop {string}  title 用户名字
 * @prop {number}  type 免费还是付费用户
 * @prop {string}  subTitle 额外信息
 * @prop {string}  icon 用户头像右下角图标
 * @prop {string}  label 额外信息
 * @prop {string}  onClick 点击事件
 * @prop {string}  isShowBottomLine 是否显示分割线
 */
// TODO 点击穿透问题之后想办法解决
const Index = ({
  imgSrc,
  title = '',
  type = 0,
  subTitle,
  label,
  index,
  onClick = noop,
  userId,
  platform,
  itemStyle = {},
  className = '',
}) => {

  const handleClick = (e) => {
    e.stopPropagation();
    const avatarPopup = e?.currentTarget.querySelector("#avatar-popup");
    if( e && avatarPopup && avatarPopup.contains(e.target)) { // 处理来源于Avatar弹框的点击
      return;
    }
    onClick(userId);
  };

  const classString = `${styles.listItem} ${className}`;

  return (
    <div className={classString.trim()} key={index} onClick={handleClick} style={itemStyle}>
      <div className={styles.wrapper}>
          <div className={styles.header}>
              <Avatar 
                className={styles.img} 
                image={imgSrc} 
                name={title} 
                isShowUserInfo={platform === 'pc'}
                userId={userId}
                userType={type}
              />
          </div>

          <div className={styles.content}>
              <span className={styles.title}>{title}</span>
              {subTitle && <span className={styles.subTitle}>{subTitle}</span>}
          </div>
      </div>

      {
        label || label === '' ? (
          <div className={styles.footer}>
            <span className={styles.label}>{label}</span>
            <Icon className={styles.rightIcon} name="RightOutlined" size={12} />
          </div>
        ) : (
          <Button type="primary" className={styles.button} onClick={handleClick}><span>查看主页</span></Button>
        )
      }
    </div>
  );
};

export default React.memo(Index);
