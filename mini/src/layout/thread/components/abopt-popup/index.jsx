import React, { useState } from 'react';
import Popup from '@discuzq/design/dist/components/popup/index';
import Button from '@discuzq/design/dist/components/button/index';
import Slider from '@discuzq/design/dist/components/slider/index';
import { debounce } from '@common/utils/throttle-debounce';
import { View } from '@tarojs/components';
import styles from './index.module.scss';

const InputPop = (props) => {
  const { visible, onOkClick, onCancel, rewardAmount } = props;

  const [value, setValue] = useState(0);
  const [moneyNum, setMoneyNum] = useState(0);

  // const onInputChange = (val) => {
  //   if (Number(val) >= 0 && Number(val) <= 100) {
  //     setValue(val);
  //     setMoneyNum(Number(val) * 0.01 * rewardAmount);
  //   } else {
  //     Toast.success({
  //       content: '请输入0-100',
  //     });
  //   }
  // };
  const onInputChange = (val) => {
    setValue(Number(val));
    setMoneyNum((Number(val) * 0.01 * rewardAmount).toFixed(2));
  };

  const onSubmitClick = async () => {
    if (typeof onOkClick === 'function') {
      try {
        const success = await onOkClick(moneyNum);
        if (success) {
          setValue(0);
          setMoneyNum(0);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <Popup position="bottom" visible={visible} onClose={onCancel} customScroll={true}>
      <View className={styles.container}>
        <View className={styles.main}>
          <View className={styles.header}>采纳回复悬赏</View>
          <View className={styles.body}>
            <View className={styles.percentage}>
              <View className={styles.text}>悬赏百分比</View>
              <View className={styles.slider}>
                <Slider
                  defaultValue={value}
                  value={value}
                  max={100}
                  min={0}
                  step={1}
                  onChange={debounce((val) => onInputChange(val), 200)}
                />
                <View className={styles.perCent}>%</View>
              </View>
            </View>
            <View className={styles.rewardMoney}>
              <View className={styles.text}>悬赏金额</View>
              <View className={styles.moneyNum}>{moneyNum}元</View>
            </View>
          </View>
        </View>
        <View className={styles.button}>
          <Button full={true} onClick={onCancel} className={styles.cancel} type="text" size="medium">
            取消
          </Button>
          <Button full={true} onClick={onSubmitClick} className={styles.ok} type="primary" size="medium">
            确定
          </Button>
        </View>
      </View>
    </Popup>
  );
};

export default InputPop;
