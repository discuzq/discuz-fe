import React from 'react';
import { inject, observer } from 'mobx-react';
import { View, Text } from '@tarojs/components';
import Popover from '@components/popover';
import { Icon, Button } from '@discuzq/design';
import DataStatisticsCards from '@components/data-statistics-cards';
import SectionTitle from '@components/section-title';
import Router from '@discuzq/sdk/dist/router';
import Thread from '@components/thread';
import IncomeDetails from './income-details'
import classNames from 'classnames';
import styles from './index.module.scss';

class UserCenterShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataStatistics: [
        {
          id: 'totalMoneyNumber',
          label: '总收益（元）',
          value: 0.00,
          visible: true,
        },
        {
          id: 'totalSharerNumber',
          label: '总分享（篇）',
          value: 123,
          visible: true,
        },
        {
          id: 'totalThreadFissionMoney',
          label: '裂变率（%）',
          value: 50,
          visible: true,
        }
      ],
      makeMoneyConfig: [
        {
          title: '分享领红包',
          explain: '阅读量达到次数，即可获得奖励',
          icon: 'ShareAltOutlined',
          type: 'share'
        },
        {
          title: '回复领红包',
          explain: '回复发布内容，即可获得奖励',
          icon: 'CommentOutlined',
          type: 'comment'
        },
        {
          title: '集赞领红包',
          explain: '评论集赞达到数量，即可获得奖励',
          icon: 'LikeOutlined',
          type: 'praise',
          // onClick: null,
        }
      ]
    };
  }

  handleMakeMoneyItem = (item) => {
    if (item.onClick && typeof item.onClick === 'function') {
      item.onClick(item);
      return;
    }

    item.type && Router.push({ url: `/userPages/my/ranking/index?page=${item.type}` });
  };

  renderPopver() {
    return (
      <View className={styles.popoverBox}>
        <Popover
          content={
            <View className={styles.popoverContent}>
              <View>
                <Text>分享收益来源是完成分享任务获得红包奖励或解锁付费帖内容</Text>
              </View>
              <View>
                <Text>分享者包括分享领红包和付费帖分享裂变活动</Text>
              </View>
            </View>
          }
        >
          <Text className={styles.popoverText}>收益说明</Text>
          <Icon name="EyeOutlined" color="#8490A8"></Icon>
        </Popover>
      </View>
    );
  }

  renderMakeMoney () {
    const { makeMoneyConfig } = this.state;
    return (
      <View>
        {
          makeMoneyConfig.map((item, index) => {
            return (
              <View
                key={index}
                className={styles.makeMoneyItem}
              >
                <Icon name={item.icon} className={styles.iconBox} size={24}></Icon>
                
                <View class={styles.makeMoneyContent}>
                  <View className={styles.makeMoneyTitle}><Text>{item.title}</Text></View>
                  <View className={styles.makeMoneyExplain}><Text>{item.explain}</Text></View>
                </View>
                <Button size="large" className={styles.makeMoneyBtn} onClick={() => {
                  this.handleMakeMoneyItem(item)
                }}>去赚钱</Button>
              </View>
            )
          })
        }
        
      </View>
    )
  }

  renderUnlockPaidContent () {
    return (
      <View>
        <Text>解锁付费内容列表-开发中</Text>
      </View>
    )
  }

  renderTheadList () {
    return (
      <View>
        {this.props.threads.map((itemInfo, index) => (
          <View key={index} className={index === 0 ? styles.threadFirstItem : styles.threadItem}>
            <Thread
              key={`${itemInfo.threadId}-${itemInfo.updatedAt}-${itemInfo.user.avatar}`}
              showBottomStyle={this.props.showBottomStyle}
              data={itemInfo}
            />
          </View>
        ))}
      </View>
    );

  }

  

  render() {
    const { dataStatistics } = this.state;
    return (
      <View>
        <View className={classNames(styles.dividerContainer, styles.dividerBottom)}>
          {this.renderPopver()}
          <DataStatisticsCards dataSource={dataStatistics} rowCardCount={3} />
        </View>
        <View className={classNames(styles.dividerContainer, styles.dividerContainerMoney)}>
          { this.renderMakeMoney() }
        </View>
        <View className={classNames(styles.dividerContainer, styles.dividerBottom)}>
          <SectionTitle title="收益明细" isShowMore={false} />
          <IncomeDetails/>
        </View>
        <View className={classNames(styles.dividerContainer, styles.dividerBottom)}>
          <SectionTitle title="解锁付费内容" isShowMore={false} />
          { this.renderUnlockPaidContent() }
        </View>
        <View>
          <View className={styles.threadHeader}>
            <SectionTitle title="分享列表" isShowMore={false} />
          </View>
          { this.renderTheadList() }
        </View>
      </View>
    );
  }
}

export default UserCenterShare;
