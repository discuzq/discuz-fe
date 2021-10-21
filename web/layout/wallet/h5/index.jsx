import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import { Tabs, Icon, Button, Toast } from '@discuzq/design';
import Header from '@components/header';
import WalletInfo from './components/wallet-info/index';
import IncomeList from './components/income-list/index';
import PayList from './components/pay-list/index';
import WithdrawalList from './components/withdrawal-list/index';
import classNames from 'classnames';
import FilterView from './components/all-state-popup';
import DatePickers from '@components/thread/date-picker';
import { formatDate } from '@common/utils/format-date.js';
import { INCOME_DETAIL_CONSTANTS, EXPAND_DETAIL_CONSTANTS, CASH_DETAIL_CONSTANTS } from '@common/constants/wallet';
import List from '@components/list';
import { typeFilter } from './adapter';
import BaseLayout from '@components/base-layout'

import layout from './layout.module.scss';

const DATE_PICKER_CONFIG = {
  year: {
    format: 'YYYY',
    caption: 'Year',
    step: 1,
  },
  month: {
    format: 'MM',
    caption: 'Mon',
    step: 1,
  },
};

@inject('wallet')
@observer
class WalletH5Page extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tabsType: 'income',
      visibleshow: false,
      consumptionTimeshow: false,
      consumptionTime: new Date(),
      page: 1,
      totalPage: 1,
      selectType: 'all', // 筛选类型
    };
  }
  async componentDidMount() {
    const { getUserWalletInfo } = this.props.wallet;
    await getUserWalletInfo();
  }
  // 点击冻结金额
  onFrozenAmountClick() {
    this.props.router.push('/wallet/frozen');
  }

  // 切换选项卡
  onTabActive = (val) => {
    this.props.wallet.resetInfo()
    this.setState({
      tabsType: val,
    });
    this.initSelectType(() => {
      this.initStateAndFetch();
    });
  };

  initSelectType = (callback) => {
    this.setState(
      {
        selectType: 'all',
      },
      callback,
    );
  };

  initStateAndFetch = () => {
    this.setState(
      {
        page: 1,
        totalPage: 1,
      },
      () => {
        switch (this.state.tabsType) {
          case 'income':
            this.fetchIncomeDetail();
            break;
          case 'pay':
            this.fetchExpendDetail();
            break;
          case 'withdrawal':
            this.fetchCashDetail();
            break;
        }
      },
    );
  };

  // 点击提现
  toWithrawal = () => {
    this.props.router.push('/wallet/withdrawal');
  };

  handleTimeSelectorClick = () => {
    this.setState({ consumptionTimeshow: true });
  };

  handleTypeSelectorClick = () => {
    this.setState({ visibleshow: true });
  };

  // 关闭全部状态的弹框
  handleStateCancel = () => {
    this.setState({ visibleshow: false });
  };

  handleTypeChange = (id) => {
    this.setState(
      {
        selectType: id,
      },
      () => {
        this.initStateAndFetch();
      },
    );
  };

  handleDataPickerCancel = () => {
    this.setState({ consumptionTimeshow: !this.state.consumptionTimeshow });
  };

  // 点击确定后对时间选择的弹框的操作
  handleMoneyTime = (time) => {
    const gapTime = new Date(time).getTime() - new Date().getTime();
    if (gapTime < 0) {
      this.setState({ consumptionTime: time }, () => {
        this.initStateAndFetch();
      });
      this.setState({ consumptionTimeshow: false });
    } else {
      Toast.warning({ content: '时间要小于当前时间' });
      return;
    }
  };

  // 根据当前选项渲染下拉选择器内容
  renderSelectContent = () => {
    const defaultType = {
      id: 'all',
    };

    let dataSource = {};
    switch (this.state.tabsType) {
      case 'income':
        dataSource = INCOME_DETAIL_CONSTANTS;
        defaultType.title = '全部类型';
        break;
      case 'pay':
        dataSource = EXPAND_DETAIL_CONSTANTS;
        defaultType.title = '全部类型';
        break;
      case 'withdrawal':
        dataSource = CASH_DETAIL_CONSTANTS;
        defaultType.title = '全部状态';
    }

    const dataSourceArray = Object.values(dataSource).map(item => ({ title: item.text, id: item.code }));

    dataSourceArray.unshift(defaultType);

    return dataSourceArray;
  };

  renderSelectTitle = () => {
    switch (this.state.tabsType) {
      case 'income':
      case 'pay':
        return '选择类型';
      case 'withdrawal':
        return '选择状态';
    }
  };

  fetchIncomeDetail = async () => {
    try {
      const detailRes = await this.props.wallet.getInconmeDetail({
        page: this.state.page,
        type: this.state.selectType,
        date: this.state.consumptionTime,
      });
      const pageState = {
        totalPage: detailRes.totalPage,
      };
      if (this.state.page <= pageState.totalPage) {
        Object.assign(pageState, {
          page: this.state.page + 1,
        });
      }
      this.setState(pageState);

      return
    } catch (e) {
      console.error(e);
      if (e.Code) {
        Toast.error({
          content: e.Msg,
          duration: 1000,
        });
      }
      return Promise.reject()
    }
  };

  fetchExpendDetail = async () => {
    const detailRes = await this.props.wallet.getExpendDetail({
      page: this.state.page,
      type: this.state.selectType,
      date: this.state.consumptionTime,
    });
    const pageState = {
      totalPage: detailRes.totalPage,
    };
    if (this.state.page <= pageState.totalPage) {
      Object.assign(pageState, {
        page: this.state.page + 1,
      });
    }
    this.setState(pageState);

    return
  };

  fetchCashDetail = async () => {
    const detailRes = await this.props.wallet.getCashLog({
      page: this.state.page,
      type: this.state.selectType,
      date: this.state.consumptionTime,
    });
    const pageState = {
      totalPage: detailRes.totalPage,
    };
    if (this.state.page <= pageState.totalPage) {
      Object.assign(pageState, {
        page: this.state.page + 1,
      });
    }
    this.setState(pageState);

    return
  };

  listRenderDataFilter = (data) => {
    const targetTypeData = typeFilter(data, this.state.selectType);
    const targetDateData = typeFilter(targetTypeData, formatDate(this.state.consumptionTime, 'yyyy-MM'));
    if (Object.keys(targetDateData).length === 0) return [];
    return Object.values(targetDateData).reduce((fullData, pageData) => [...fullData, ...pageData]);
  };

  // 点击切换tag的显示
  renderSelectedType = () => {
    if (this.state.selectType === 'all') {
      if (this.state.tabsType === 'withdrawal') {
        return '全部状态';
      }
      return '全部类型';
    }
    let arr = {};
    switch (this.state.tabsType) {
      case 'income':
        arr = INCOME_DETAIL_CONSTANTS;
        break;
      case 'pay':
        arr = EXPAND_DETAIL_CONSTANTS;
        break;
      case 'withdrawal':
        arr = CASH_DETAIL_CONSTANTS;
    }

    for (const key in arr) {
      if (arr[key].code === this.state.selectType) {
        return arr[key].text || '';
      }
    }
  }

  renderFooter = () => {
    return (
      <div className={layout.footer}>
        <div className={layout.footerInner}>
          <Button className={layout.button} onClick={this.toWithrawal} >
            提现
          </Button>
        </div>
      </div>
    )
  }

  // 处理上拉加载更多逻辑
  handleOnRefresh = () => {
    const { tabsType } = this.state
    if (tabsType === 'income') {
      return this.fetchIncomeDetail()
    } else if (tabsType === 'pay') {
      return this.fetchExpendDetail()
    } else if (tabsType === 'withdrawal') {
      return this.fetchCashDetail()
    }
    return Promise.resolve()
  }

  render() {
    const tabList = [
      [
        'income',
        <div className={layout.tagbox} key="income">
          <Icon
            name="TicklerOutlined"
            className={classNames(layout.tag, {
              [layout['tag-active-green']]: this.state.tabsType !== 'income',
            })}
          />
          收入明细
        </div>,
        { name: 'TicklerOutlined' },
      ],
      [
        'pay',
        <div className={layout.tagbox} key="pay">
          <Icon
            name="WallOutlined"
            className={classNames(layout.tag, {
              [layout['tag-active-blue']]: this.state.tabsType !== 'pay',
            })}
          />
          支出明细
        </div>,
        { name: 'WallOutlined' },
      ],
      [
        'withdrawal',
        <div className={layout.tagbox} key="withdrawal">
          <Icon
            name="TransferOutOutlined"
            className={classNames(layout.tag, {
              [layout['tag-active-red']]: this.state.tabsType !== 'withdrawal',
            })}
          />
          提现记录
        </div>,
        { name: 'TransferOutOutlined' },
      ],
    ];
    const { walletInfo, incomeDetail = {}, expandDetail, cashDetail } = this.props.wallet;

    const incomeData = this.listRenderDataFilter(incomeDetail) || [];
    const expandData = this.listRenderDataFilter(expandDetail) || [];
    const cashData = this.listRenderDataFilter(cashDetail) || [];

    return (
      <BaseLayout
        noMore={this.state.page > this.state.totalPage}
        onRefresh={this.handleOnRefresh}
        className={layout.container}
        footer={this.renderFooter()}
        immediateCheck
      >
        <div className={layout.header}>
          <WalletInfo
            walletData={walletInfo}
            webPageType="h5"
            onFrozenAmountClick={() => this.onFrozenAmountClick()}
          ></WalletInfo>
        </div>

        <div className={layout.choiceTime}>
          <div className={layout.status} onClick={this.handleTypeSelectorClick}>
            <span className={layout.text}>
              {this.renderSelectedType()}
            </span>
            <Icon name="UnderOutlined" size="6" className={layout.icon}></Icon>
          </div>
          <div className={layout.status} onClick={this.handleTimeSelectorClick}>
            <span className={layout.text}>
              {formatDate(this.state.consumptionTime, 'yyyy年MM月') || formatDate(new Date(), 'yyyy年MM月')}
            </span>
            <Icon name="UnderOutlined" size="6" className={layout.icon}></Icon>
          </div>
        </div>

        <div className={layout.tabs}>
          <Tabs scrollable={true} className={layout.tabList} onActive={this.onTabActive}>
            {tabList.map(([id, label, icon]) => (
              <Tabs.TabPanel key={id} id={id} label={label} name={icon.name}></Tabs.TabPanel>
            ))}
          </Tabs>

          {this.state.tabsType === 'income' &&
            incomeData.map((value, index) => (
              <IncomeList key={value.id} incomeVal={value} itemKey={index} dataLength={incomeData.length} />
            ))
          }

          {this.state.tabsType === 'pay' &&
            expandData.map((value, index) => (
              <PayList key={value.id} payVal={value} itemKey={index} dataLength={expandData.length} />
            ))
          }

          {this.state.tabsType === 'withdrawal' &&
            cashData.map((value, index) => (
              <WithdrawalList key={value.id} withdrawalVal={value} itemKey={index} dataLength={cashData.length} />
            ))
          }
        </div>

        <FilterView
          value={this.state.selectType}
          data={this.renderSelectContent()}
          title={this.renderSelectTitle()}
          visible={this.state.visibleshow}
          handleCancel={this.handleStateCancel}
          handleSubmit={this.handleTypeChange}
        />
        <DatePickers
          time={new Date(this.state.consumptionTime) || new Date}
          isOpen={this.state.consumptionTimeshow}
          onCancels={this.handleDataPickerCancel}
          onSelects={this.handleMoneyTime}
          dateConfig={DATE_PICKER_CONFIG}
        />
      </BaseLayout>
    );
  }
}

export default withRouter(WalletH5Page);
