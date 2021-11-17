import React from 'react';
import { inject, observer } from 'mobx-react';
import DataStatisticsCards from '@components/data-statistics-cards';
import { Icon } from '@discuzq/design';
import { Popover } from '@discuzq/design';
import SectionTitle from '@components/section-title';
import Router from '@discuzq/sdk/dist/router';
import ThreadList from '@components/user-center-create/thread-list';
import classnames from 'classnames';
import styles from './index.module.scss';
import { priceFormat } from '@common/utils/price-format';
import classNames from 'classnames';
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
          value: priceFormat(266),
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
    const { site } = this.props;
    const { platform } = site || {};
    return (
      <div className={classNames(platform === 'pc' ? styles.pc : styles.h5)}>
        <div className={classNames(styles.dividerContainer, styles.dividerBottom)}>
          {this.renderPopver()}
          <DataStatisticsCards dataSource={dataStatistics} rowCardCount={platform === 'pc' ? 5 : 3} />
        </div>
        <div className={styles.createList}>
          <div className={styles.threadHeader}>
            <SectionTitle title="我的创作" isShowMore={false} />
          </div>
          <ThreadList dataSource={this.props.threads}/>
        </div>
      </div>
    );
  }
}

export default UserCenterCreate;
