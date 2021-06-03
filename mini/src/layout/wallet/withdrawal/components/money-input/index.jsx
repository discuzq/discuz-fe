import React, { useEffect, useMemo } from 'react';
import Input from '@discuzq/design/dist/components/input/index';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

const MoneyInput = (props) => {
  const { getmoneyNum, visible, minmoney = 1, maxmoney, inputValue: value, updateState, onChange } = props;

  // const [value, setValue] = useState('');

  // const onChange = (data) => {
  //   const datas = data.match(/([1-9]\d{0,9}|0)(\.\d{0,2})?/);
  //   setValue(datas ? datas[0] : '');
  //   getmoneyNum(datas ? datas[0] : '');
  // };

  const handleChange = (data) => {
    if (typeof onChange === 'function') {
      onChange(data);
    }
  };

  const getColorShow = useMemo(() => {
    if (value == 0.0) {
      return '';
    } else if (parseFloat(maxmoney) < parseFloat(value)) {
      return styles.InputRedColor;
    } else {
      return styles.InputColor;
    }
  }, [value]);

  useEffect(() => {
    updateState({ name: 'inputValue', value: '' });
  }, [visible]);

  return (
    <View className={styles.container}>
      <View className={styles.header}>提现金额</View>
      <View className={styles.input}>
        <Text className={parseFloat(maxmoney) < parseFloat(value) ? styles['moneyIcon-Red'] : styles.moneyIcon}>
          ￥
        </Text>
        <Input
          className={getColorShow}
          value={value}
          placeholder="0.00"
          onChange={(e) => handleChange(e.target.value)}
          mode="number"
        />
      </View>
      <View className={styles.leastMoney}>
        {parseFloat(maxmoney) < parseFloat(value) && (
          <Text className={styles.leasterr}>提现金额不得大于可提现金额</Text>
        )}
        提现金额最低{minmoney}元
      </View>
    </View>
  );
};

export default MoneyInput;
