import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@discuzq/design';
import styles from './index.module.scss';

const MoneyInput = (props) => {
  const { getmoneyNum, visible, minAmount = 0, maxAmount, inputValue: value, updateState, onChange } = props;

  const handleChange = (data) => {
    if (typeof onChange === 'function') {
      onChange(data);
    }
  };

  const getColorShow = useMemo(() => {
    if (value == 0.0) {
      return '';
    }
    if (parseFloat(maxAmount) < parseFloat(value)) {
      return styles.InputRedColor;
    }
    return styles.InputColor;
  }, [value]);

  useEffect(() => {
    updateState({ name: 'inputValue', value: '' });
  }, [visible]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>提现金额</div>
      <div className={styles.input}>
        <span className={parseFloat(maxAmount) < parseFloat(value) ? styles['moneyIcon-Red'] : styles.moneyIcon}>
          ￥
        </span>
        <Input
          className={getColorShow}
          value={value}
          placeholder="0.00"
          onChange={e => handleChange(e.target.value)}
          mode="number"
        />
      </div>
      <div className={styles.leastMoney}>
        {parseFloat(maxAmount) < parseFloat(value) && <p className={styles.leasterr}>提现金额不得大于可提现金额</p>}
        提现金额最低{minAmount || 0}元
      </div>
    </div>
  );
};

export default MoneyInput;
