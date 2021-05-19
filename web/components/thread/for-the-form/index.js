/**
 * 悬赏表单 - 日历选择
 * pc部分使用需 npm install react-datepicker --save 或者 yarn add react-datepicker
 * 详细案例参考 https://github.com/Hacker0x01/react-datepicker/
 */
import React, { memo, useState, useEffect } from 'react'; // 性能优化的
import { Button, Input, Toast, Icon } from '@discuzq/design'; // 原来就有的封装
import DatePickers from '@components/thread/date-picker'; // 原来就有的封装
import DDialog from '@components/dialog';
import DatePicker from 'react-datepicker';
import { formatDate } from '@common/utils/format-date.js';

import 'react-datepicker/dist/react-datepicker.css';
import styles from './index.module.scss'; // 私有样式
import PropTypes from 'prop-types'; // 类型拦截

const ForTheForm = ({ confirm, cancel, data, pc, visible }) => {
  const [value, setValue] = useState('');// 悬赏金额
  // const [times, setTimes] = useState(formatDate(new Date(), 'yyyy-MM-dd h:mm'));// 悬赏的到期时间
  const [times, setTimes] = useState(new Date());// 悬赏的到期时间
  const [show, setShow] = useState(false);// 时间选择器是否显示

  // 时间选择器是否显示
  useEffect(() => {
    if (data !== undefined && Object.keys(data).length > 0) {
      if (data.value) setValue(data.value);
      if (data.times) setTimes(data.times);
    }
  }, []);

  // 点击确定的时候返回参数
  const redbagconfirm = () => {
    if (value < 0.1 || value > 1000000) {
      Toast.warning({ content: '金额数不合理,0.1<money<1000000' });
      return;
    }
    const gapTime = new Date(times).getTime() - new Date().getTime();

    if (gapTime < 24 * 3600 * 1000) {
      Toast.warning({ content: '悬赏时间要大于当前时间24小时' });
      return;
    }
    confirm({
      value,
      times: formatDate(times, 'yyyy/MM/dd h:mm'),
    });
  };
  const content = (
    <div className={styles.rewards}>
      <div className={styles['line-box']}>
        <div className={styles.label}>悬赏金额</div>
        <div className={styles.item}>
          <Input
            mode="number"
            value={value}
            placeholder="金额"
            onChange={e => setValue(Number(e.target.value))}
          />
          元
        </div>
      </div>
      <div className={styles['line-box']}>
        <div className={styles.label}>悬赏结束时间</div>
        <div className={styles.item}>
          {pc
            ? (
              <>
                <DatePicker
                  selected={new Date(times)}
                  minDate={new Date()}
                  onChange={date => setTimes(formatDate(date, 'yyyy/MM/dd h:mm'))}
                  showTimeSelect
                  dateFormat="yyyy/MM/dd HH:mm:ss"
                  locale="zh"
                />
                <Icon name="RightOutlined" />
              </>
            )
            : (
              <>
                <div onClick={() => setShow(true)} > {`${formatDate(times, 'yyyy/MM/dd h:mm')}`} </div>
                <Icon name="RightOutlined" />
              </>
            )}
        </div>
      </div>
      {pc ? '' : (
        <>
          <DatePickers
            onSelects={(e) => {
              setTimes(e);
              setShow(false);
            }}
            isOpen={show} onCancels={() => setShow(false)}
          />
          <div className={styles.btn}>
            <Button onClick={() => cancel()}>取消</Button>
            <Button type="primary" onClick={redbagconfirm}>确定</Button>
          </div>
        </>
      )
      }
    </div>
  );
  if (!pc) return content;
  return (
    <DDialog
      visible={visible}
      className={styles.pc}
      onClose={cancel}
      onCacel={cancel}
      onConfirm={redbagconfirm}
      title="悬赏问答"
    >
      {content}
    </DDialog>
  );
};

ForTheForm.propTypes = {
  cancel: PropTypes.func.isRequired, // 限定cancle的类型为functon,且是必传的
  confirm: PropTypes.func.isRequired, // 限定confirm的类型为functon,且是必传的
};

// 设置props默认类型
ForTheForm.defaultProps = {
  confirm: () => { },
  // data: { value: 3, times: '2021-04-1917:54' }, //重现传参参照
  cancel: () => { }, // 点击取消调用的事件
};

export default memo(ForTheForm);
