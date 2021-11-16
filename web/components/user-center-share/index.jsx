import React from 'react';
import { inject, observer } from 'mobx-react';
import { Icon, Button, Popover } from '@discuzq/design';
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
      <div className={styles.popoverBox}>
        <Popover
          content={
            <div className={styles.popoverContent}>
              <div>
                <span>分享收益来源是完成分享任务获得红包奖励或解锁付费帖内容</span>
              </div>
              <div>
                <span>分享者包括分享领红包和付费帖分享裂变活动</span>
              </div>
            </div>
          }
        >
          <span className={styles.popoverText}>收益说明</span>
          <Icon name="HelpOutlined" color="#8490A8"></Icon>
        </Popover>
      </div>
    );
  }

  renderMakeMoney () {
    const { makeMoneyConfig } = this.state;
    return (
      <div>
        {
          makeMoneyConfig.map((item, index) => {
            return (
              <div
                key={index}
                className={styles.makeMoneyItem}
              >
                <Icon name={item.icon} className={styles.iconBox} size={24}></Icon>
                
                <div class={styles.makeMoneyContent}>
                  <div className={styles.makeMoneyTitle}><span>{item.title}</span></div>
                  <div className={styles.makeMoneyExplain}><span>{item.explain}</span></div>
                </div>
                <Button size="large" className={styles.makeMoneyBtn} onClick={() => {
                  this.handleMakeMoneyItem(item)
                }}>去赚钱</Button>
              </div>
            )
          })
        }
        
      </div>
    )
  }

  renderUnlockPaidContent () {
    return (
      <div>
        <span>解锁付费内容列表-开发中</span>
      </div>
    )
  }

  renderTheadList () {
    return (
      <div>
        {this.props.threads.map((itemInfo, index) => (
          <div key={index} className={index === 0 ? styles.threadFirstItem : styles.threadItem}>
            <Thread
              key={`${itemInfo.threadId}-${itemInfo.updatedAt}-${itemInfo.user.avatar}`}
              showBottomStyle={this.props.showBottomStyle}
              data={itemInfo}
            />
          </div>
        ))}
      </div>
    );

  }

  

  render() {
    const { dataStatistics } = this.state;
    return (
      <div>
        <div className={classNames(styles.dividerContainer, styles.dividerBottom)}>
          {this.renderPopver()}
          <DataStatisticsCards dataSource={dataStatistics} rowCardCount={3} />
        </div>
        <div className={classNames(styles.dividerContainer, styles.dividerContainerMoney)}>
          { this.renderMakeMoney() }
        </div>
        <div className={classNames(styles.dividerContainer, styles.dividerBottom)}>
          <SectionTitle title="收益明细" isShowMore={false} />
          <IncomeDetails/>
        </div>
        <div className={classNames(styles.dividerContainer, styles.dividerBottom)}>
          <SectionTitle title="解锁付费内容" isShowMore={false} />
          { this.renderUnlockPaidContent() }
        </div>
        <div>
          <div className={styles.threadHeader}>
            <SectionTitle title="分享列表" isShowMore={false} />
          </div>
          { this.renderTheadList() }
        </div>
      </div>
    );
  }
}

export default UserCenterShare;
