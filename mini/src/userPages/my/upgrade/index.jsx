import React, { useState, useEffect } from 'react';
import styles from './index.module.scss';
import { View, Text } from '@tarojs/components';
import Button from '@discuzq/design/dist/components/button/index';
import Tabs from '@discuzq/design/dist/components/tabs/index';
import { inject, observer } from 'mobx-react';
import time from '@discuzq/sdk/dist/time';
import { payGroupLevelStyle as levelStyle } from '@common/constants/const';
import groupPay from '@common/pay-bussiness/group-pay';
import classnames from 'classnames';
import Taro from '@tarojs/taro';

const MemberShipCard = ({ site, user, onRenewalFeeClick, shipCardClassName }) => {
  // const { siteMode, isPC } = site;
  const { userInfo, paid, isAdmini, isIndefiniteDuration, expiredDays, expiredAt, payGroups, } = user;
  // const { group = {} } = userInfo || {};
  // const { level, remainDays, expirationTime, groupName, description, isTop, hasPayGroup, amount, groupId, typeTime, remainTime } = group;
  // const theme = levelStyle[level] || {};
  // const isPaySite = siteMode === 'pay';

  const [defaultActive, setDefaultActive] = useState(1);

  useEffect(async () => {
    const { level = 1 } = Taro.getCurrentInstance().router.params;
    setDefaultActive(Number(level) || 1);
  }, []);

  // 执行付费
  const doPay = async ({ amount, groupId, title }) => {
    try {
      await groupPay({ amount, groupId, title, user, site });
    } catch (error) {}
  };

  const renderCard = (data) => {
    const { groupName, level, description } = data;
    const theme = levelStyle[level] || {};
    return (
      <View className={`${styles.memberShipCardWrapper} ${shipCardClassName}`} style={{backgroundImage: `url(${theme.bgImg})`}}>
        <View className={styles.MemberShipCardContent}>
          <View className={styles.roleType} style={{color: theme.groupNameColor}}>{groupName}</View>
          <View className={styles.tagline} style={{color: theme.desAndDateColor}}>{level > 0 ? description : '访问海量站点内容'}</View>
          {/* <View className={styles.RenewalFee} style={{visibility: noBtn ? 'hidden' : 'visible'}}>
            {renderButton()}
            <Text className={styles.feeTimer}>{renderFeeDateContent()}</Text>
          </View> */}
        </View>
      </View>
    );
  };

  return (
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
                [styles.mobileTabPanel]: true
              })}>
                {renderCard(data)}
                <View className={classnames(styles.operation, {
                  [styles.mobileOperation]: true
                })}>
                  <View className={styles.top}>
                    <View className={styles.mobileUpgradePrice}>
                      <Text className={styles.symbol}>￥</Text>
                      <Text className={styles.price}>{fee}</Text>
                    </View>
                    <View className={styles.time}>有效期：{`${days}天`}</View>
                  </View>

                  {level > group.level && <Button className={styles.upgradeBtn} style={{margin: 0}} onClick={() => doPay({amount, title: '付费用户组升级', groupId })}>立即升级</Button>}
                </View>
              </View>

              <View className={styles.tips} style={{padding: '16px'}}>
                <View className={styles.title}>购买须知</View>
                <View className={styles.text}>{notice}</View>
              </View>
            </View>
          </Tabs.TabPanel>
        );
      })}
    </Tabs>
  );

};

export default inject('site', 'user')(observer(MemberShipCard));