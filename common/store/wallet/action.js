import { action } from 'mobx';
import WalletStore from './store';
import { readWalletUser, readWalletLog, readWalletCash, createWalletCash } from '@server';
import time from '@discuzq/sdk/dist/time';
import { get } from '@common/utils/get';

const setWalletInfoPageData = (data, obj, {
  type,
  date,
  page,
}) => {
  if (!obj[type]) {
    obj[type] = {};
  }
  if (!obj[type][date]) {
    obj[type][date] = {};
  }
  if (!obj[type][date][page]) {
    obj[type][date][page] = get(data, 'pageData', []);
  }
};


class WalletAction extends WalletStore {
    @action
    resetInfo = () => {
      // 收入明细
      this.incomeDetail = {}
      // 支出明细
      this.expandDetail = {}
      // 冻结明细
      this.freezeDetail = {}
      // 提现明细
      this.cashDetail = {}
    }

    @action
    getUserWalletInfo = async () => {
      const walletInfoRes = await readWalletUser();
      if (walletInfoRes.code === 0) {
        this.walletInfo = walletInfoRes.data;
      }
    }

    // 获取收入明细
    @action
    getInconmeDetail = async ({ ...props }) => {
      const { page = 1, date = time.formatDate(new Date(), 'YYYY-MM'), type = 'all' } = props;
      const param = {
        walletLogType: 'income',
        page,
        perPage: 22,
      };
      const filter = {
        startTime: time.getMonthStartAndEnd(date)[0],
        endTime: time.getMonthStartAndEnd(date)[1],
      };
      if (type !== 'all') {
        filter.changeType = String(type).split(',');
      }

      Object.assign(param, {
        filter,
      });
      const detailInfoRes = await readWalletLog({
        params: param,
      });

      if (detailInfoRes.code === 0) {
        setWalletInfoPageData(detailInfoRes.data, this.incomeDetail, {
          type,
          date: time.formatDate(date, 'YYYY-MM'),
          page,
        });

        return detailInfoRes.data;
      }

      throw {
        Code: detailInfoRes.code,
        Msg: detailInfoRes.Msg,
      };
    }

    // 获取支出明细
    @action
    getExpendDetail = async ({ ...props }) => {
      const { page = 1, date = time.formatDate(new Date(), 'YYYY-MM'), type = 'all' } = props;
      const param = {
        walletLogType: 'expend',
        page,
        perPage: 22,
      };
      const filter = {
        startTime: time.getMonthStartAndEnd(date)[0],
        endTime: time.getMonthStartAndEnd(date)[1],
      };
      if (type !== 'all') {
        filter.changeType = String(type).split(',');
      }
      Object.assign(param, {
        filter,
      });

      const detailInfoRes = await readWalletLog({
        params: param,
      });

      if (detailInfoRes.code === 0) {
        setWalletInfoPageData(detailInfoRes.data, this.expandDetail, {
          type,
          date: time.formatDate(date, 'YYYY-MM'),
          page,
        });

        return detailInfoRes.data;
      }

      throw {
        Code: detailInfoRes.code,
        Msg: detailInfoRes.Msg,
      };
    }

    // 获取冻结明细
    @action
    getFreezeDetail = async ({ ...props }) => {
      const { page = 1 } = props;
      const detailInfoRes = await readWalletLog({
        params: {
          walletLogType: 'freeze',
          page,
          perPage: 22,
        },
      });

      if (detailInfoRes.code === 0) {
        this.freezeDetail[page] = get(detailInfoRes, 'data.pageData', []);

        this.freezeDetail = {
          ...this.freezeDetail,
        };

        return detailInfoRes.data;
      }

      throw {
        Code: detailInfoRes.code,
        Msg: detailInfoRes.Msg,
      };
    }

    // 获取提现明细
    @action
    getCashLog = async ({ ...props }) => {
      const { page = 1, date = time.formatDate(new Date(), 'YYYY-MM'), type = 'all' } = props;
      const param = {
        page,
        perPage: 22,
      };

      const filter = {
        startTime: time.getMonthStartAndEnd(date)[0],
        endTime: time.getMonthStartAndEnd(date)[1],
      };

      if (type !== 'all') {
        filter.cashStatus = [type];
      }

      Object.assign(param, {
        filter,
      });

      const cashInfoRes = await readWalletCash({
        params: param,
      });

      if (cashInfoRes.code === 0) {
        setWalletInfoPageData(cashInfoRes.data, this.cashDetail, {
          type,
          date: time.formatDate(date, 'YYYY-MM'),
          page,
        });

        return cashInfoRes.data;
      }

      throw {
        Code: cashInfoRes.code,
        Msg: cashInfoRes.Msg,
      };
    }

    // 发起提现
    @action
    createWalletCash = async ({ money }) => {
      const res = await createWalletCash({
        data: {
          cashApplyAmount: money,
        },
      });

      if (res.code === 0) {
        return res.data;
      }

      throw {
        Code: res.code,
        Msg: res.msg,
      };
    }
}

export default WalletAction;
