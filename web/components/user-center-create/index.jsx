import React from 'react';
import { inject, observer } from 'mobx-react';
import DataStatisticsCards from '@components/data-statistics-cards';
import { Icon } from '@discuzq/design';
import { Popover } from '@discuzq/design';
import SectionTitle from '@components/section-title';
import Router from '@discuzq/sdk/dist/router';
import classnames from 'classnames';
import styles from './index.module.scss';
@inject('site')
@observer
class UserCenterCreate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataStatistics: [
        {
          id: 'totalReaderNumber',
          label: '阅读者（人）',
          value: 155,
          visible: true,
        },
        {
          id: 'totalSharerNumber',
          label: '分享者（人）',
          value: 30,
          visible: true,
        },
        {
          id: 'totalThreadFissionMoney',
          label: '裂变率（%）',
          value: 50,
          visible: true,
        },
        {
          id: 'fissionRate',
          label: '发出红包（元）',
          value: 266,
          visible: true,
        },
        {
          id: 'unlockContentNumber',
          label: '解锁内容（人）',
          value: 168,
          visible: true,
        },
      ],
    };
  }

  toCreatorThreatData() {
    console.log('进入帖子详情数据');
    Router.push({ url: 'my/thread-data' });
  }

  renderPopver() {
    return (
      <div className={styles.popoverBox}>
        <Popover
          placement="BL"
          showTriangle={false}
          content={
            <div
              style={{
                lineHeight: '19px',
                color: '#4F5A70',
              }}
            >
              <div>
                <span>统计到今日0:00</span>
              </div>
              <div>
                <span>分享者包括分享领红包和付费帖分享裂变活动</span>
              </div>
              <div>
                <span>裂变率仅计算分享领红包活动</span>
              </div>
            </div>
          }
        >
          <span className={styles.popoverText}>数据统计</span>
          <Icon name="EyeOutlined" color="#8490A8"></Icon>
        </Popover>
      </div>
    );
  }

  render() {
    const { dataStatistics } = this.state;
    return (
      <div className={classnames(styles.layout, this.props.userCreateClassName || null)}>
        <div className={styles.dividerContainer}>
          {this.renderPopver()}
          <DataStatisticsCards dataSource={dataStatistics} rowCardCount={this.props.site.platform === 'pc' ? 5 : 3} />
        </div>
        <div></div>
        <div className={styles.dividerContainer}>
          <div className={styles.sectionTitle}>
            <span>我的创作</span>
          </div>
          <div onClick={this.toCreatorThreatData}>
            <span>进入帖子详情</span>
          </div>
          {/* <SectionTitle title="我的创作" isShowMore={false} /> */}
        </div>
      </div>
    );
  }
}

export default UserCenterCreate;
