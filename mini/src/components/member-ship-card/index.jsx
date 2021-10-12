import React, { useState, useEffect } from 'react';
import styles from './index.module.scss';
import { View, Text } from '@tarojs/components';
import { Button, Dialog, Tabs } from '@discuzq/design';
import { inject, observer } from 'mobx-react';
import time from '@discuzq/sdk/dist/time';
import { payGroupLevelStyle as levelStyle } from '@common/constants/const';
import groupPay from '@common/pay-bussiness/group-pay';
import classnames from 'classnames';
import Header from '@components/header';

const MemberShipCard = ({ site, user, onRenewalFeeClick, shipCardClassName }) => {
  const { siteMode, isPC } = site;
  const { userInfo, paid, isAdmini, isIndefiniteDuration, expiredDays, expiredAt, getPayGroups, } = user;
  const { group = {} } = userInfo || {};
  const { level, remainDays, expirationTime, groupName, description, isTop, hasPayGroup, amount, groupId, typeTime, remainTime } = group;
  const theme = levelStyle[level] || {};
  const isPaySite = siteMode === 'pay';

  const [dialogVisible, setDialogVisible] = useState(false);
  const [payGroups, setPayGroups] = useState([]);
  const [defaultActive, setDefaultActive] = useState(1);

  // 获取付费用户组数据
  useEffect(async () => {
    const groups = await getPayGroups();
    setPayGroups(groups);
  }, []);


  // 打开升级付费用户组的弹窗
  const handlePayGroupRenewal = (upgradeLevel) => {
    setDefaultActive(upgradeLevel);
    setDialogVisible(true);
  };

  // 处理付费站点续费
  const handleRenewalFee = () => {
    typeof onRenewalFeeClick === 'function' && onRenewalFeeClick();
  };

  // 执行付费
  const doPay = async ({ amount, groupId, title }) => {
    setDialogVisible(false);
    try {
      await groupPay({ amount, groupId, title, user, site });
    } catch (error) {}
  };

  // 获取日期格式
  const getDateFormat = () => {
    if (time.isCurrentYear(expiredAt)) {
      return 'MM月DD日';
    } else {
      return 'YYYY年MM月DD日';
    }
  };

  const renderFeeDateContent = () => {
    const typeMap = {
      0: '天',
      1: '时',
      2: '分',
    };
    // 付费用户组用户
    if (level > 0) {
      return (
        <>
          <Text className={styles.feeDay} style={{color: theme.otherColor}}>{remainTime}</Text>{typeMap[typeTime]}&nbsp;•&nbsp;
          <Text style={{color: theme.desAndDateColor}}>{time.formatDate(expirationTime, getDateFormat())}到期</Text>
        </>
      );
    }

    // 付费站点用户
    if (isPaySite && paid) {
      if (expiredDays === 0) {
        return (
          <>
            <Text className={styles.feeDay}>0</Text>天
          </>
        );
      } else if (isIndefiniteDuration) {
        return <Text className={styles.noTimeDate}>无限期</Text>;
      } else {
        return (
          <>
            <Text className={styles.feeDay}>{expiredDays}</Text>天&nbsp;•&nbsp;
            {time.formatDate(expiredAt, getDateFormat())}到期
          </>
        );
      }
    }
  };

  const renderButton = () => {
    const leftBtnStyle = {
      backgroundColor: theme.otherColor,
      borderColor: theme.otherColor,
      color: theme.leftBtnTextColor,
    };
    const rightBtnStyle = {
      marginLeft: '8px',
      backgroundColor: theme.rightBtnBgColor,
      borderColor: theme.otherColor,
      color: theme.otherColor,
    };

    // 付费用户组用户
    if (level > 0) {
      return (
        <>
          <Button onClick={() => doPay({amount, title: '付费用户组续费', groupId })} type="primary" className={styles.btn} style={leftBtnStyle}>续费</Button>
          {!isTop && <Button onClick={() => {handlePayGroupRenewal(level + 1)}} type="primary" className={styles.btn} style={rightBtnStyle}>升级</Button>}
        </>
      );
    }

    // 付费站点用户
    if (isPaySite && paid && !isIndefiniteDuration) {
      return (
        <Button onClick={handleRenewalFee} type="primary" className={styles.btn}>续费</Button>
      );
    }

    // 普通用户且后台设置了付费用户组
    if (hasPayGroup) {
      return <Button onClick={() => {handlePayGroupRenewal(level + 1)}} type="primary" className={styles.btn}>升级</Button>;
    }
  };

  const renderCard = (data, noBtn = false) => {
    const { groupName, level, description } = data;
    const theme = levelStyle[level] || {};
    return (
      <View className={`${styles.memberShipCardWrapper} ${shipCardClassName}`} style={{backgroundImage: `url(${theme.bgImg})`}}>
        <View className={styles.MemberShipCardContent}>
          <View className={styles.roleType} style={{color: theme.groupNameColor}}>{groupName}</View>
          <View className={styles.tagline} style={{color: theme.desAndDateColor}}>{level > 0 ? description : '访问海量站点内容'}</View>
          <View className={styles.RenewalFee} style={{visibility: noBtn ? 'hidden' : 'visible'}}>
            {renderButton()}
            <Text className={styles.feeTimer}>{renderFeeDateContent()}</Text>
          </View>
        </View>
      </View>
    );
  };

  return isAdmini ? null : (
    <View className={styles.wrapper}>
      {renderCard({groupName, level, description})}
      {/* <Dialog
        className={styles.mobileDialogWrapper}
        visible={dialogVisible}
        maskClosable={true}
        onClose={() => setDialogVisible(false)}
      >
        {isPC ? null : <Header allowJump={false} customJum={() => setDialogVisible(false)} />}
        <Tabs activeId={defaultActive} onActive={activeId => setDefaultActive(activeId)}>
          {payGroups.map(({ name: groupName, level, description, fee, notice, amount, groupId, days }) => {
            const data = {
              groupName,
              level,
              description,
            };
            return (
              <Tabs.TabPanel key={level} id={level} label={groupName}>
                <View>
                  <View className={classnames(styles.tabPanel, {
                    [styles.mobileTabPanel]: !isPC
                  })}>
                    {renderCard(data, true)}
                    <View className={classnames(styles.operation, {
                      [styles.mobileOperation]: !isPC
                    })}>
                      <View className={styles.top}>
                        <View className={classnames({
                          [styles.upgradePrice]: isPC,
                          [styles.mobileUpgradePrice]: !isPC,
                        })}>
                          <Text className={styles.symbol}>￥</Text>
                          <Text className={styles.price}>{fee}</Text>
                        </View>
                        <View className={styles.time}>有效期：{`${days}天`}</View>
                      </View>

                      {level > group.level && <Button className={styles.upgradeBtn} style={{margin: isPC ? '' : 0}} onClick={() => doPay({amount, title: '付费用户组升级', groupId })}>立即升级</Button>}
                    </View>
                  </View>

                  <View className={styles.tips} style={{padding: isPC ? '' : '16px'}}>
                    <View className={styles.title}>购买须知</View>
                    <View className={styles.text}>{notice}</View>
                  </View>
                </View>
              </Tabs.TabPanel>
            );
          })}
        </Tabs>
      </Dialog> */}
    </View>
  );

};

export default inject('site', 'user')(observer(MemberShipCard));