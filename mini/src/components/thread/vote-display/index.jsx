import React, { useState, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import Checkbox from '@discuzq/design/dist/components/checkbox/index';
import Button from '@discuzq/design/dist/components/button/index';
import Icon from '@discuzq/design/dist/components/icon/index';
import Radio from '@discuzq/design/dist/components/radio/index';
import Progress from '@discuzq/design/dist/components/progress/index';
import Toast from '@discuzq/design/dist/components/toast/index';
import { View, Text } from '@tarojs/components'
import CountDown from '@common/utils/count-down';
import { debounce } from '@common/utils/throttle-debounce';
import LoginHelper from '@common/utils/login-helper';
import styles from './index.module.scss';

const CHOICE_TYPE = {
  mutiple: 2, // 多选
  single: 1, // 单选
};
const VoteDisplay = (props = {}) => {
  const { voteData, threadId, page } = props;
  const [voteObj] = voteData;
  const {
    choiceType,
    voteTitle = '',
    subitems = [],
    voteUsers,
    isExpired,
    isVoted,
    expiredAt = '',
    voteId,
  } = voteObj;

  const [isFold, setIsFold] = useState(false);
  const [day, setDay] = useState(0);
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const [value, setValue] = useState([]);

  let countDownIns = null;
  useEffect(() => {
    if (!countDownIns) countDownIns = new CountDown();
    return () => {
      countDownIns.stop();
    };
  }, []);

  useEffect(() => {
    if (countDownIns) {
      const time = expiredAt.replace(/-/g, '/');
      countDownIns.start(time, (res) => {
        const { days, hours, minutes } = res;
        setDay(days);
        setHour(hours);
        setMinute(minutes);
      });
    }
  }, [expiredAt]);

  const handleVote = debounce(async () => {
    const { thread, user, index } = props;
    if (!user.isLogin()) {
      LoginHelper.saveAndLogin();
      return;
    }
    if (value.length <= 0) {
      Toast.info({ content: '请先选择投票选项' });
      return;
    }
    const params = {
      threadId,
      vote: {
        id: voteId,
        subitemIds: value,
      },
    };
    const result = await thread.createVote(params);
    const { success, data, msg } = result;
    if (!success) Toast.info({ content: msg });
    else {
      Toast.info({ content: '投票成功' });
      const [tomId] = Object.keys(data);
      const [tomValue] = Object.values(data);
      // 详情页数据更新
      if (page === 'detail') thread.updateThread(tomId, tomValue);
      // 列表页数据更新
      else index.updateListThreadIndexes(threadId, tomId, tomValue);
    }
  }, 1000);


  if (!voteTitle) return null;
  const isVotedEnd = isExpired || isVoted; // 投票是否已结束
  const isMutiple = choiceType === CHOICE_TYPE.mutiple;
  const typeText = isMutiple ? '多选' : '单选';
  const CheckboxRadio = isMutiple ? Checkbox : Radio;
  const votedItem = subitems.filter(item => item.isVoted).map(item => item.id);
  const defaultValue = isMutiple ? votedItem : (votedItem[0] || '');

  const UnfoldOrExpand = ({ text }) => (
    <Button full type="primary"
      className={!isFold ? styles.foldbtn : styles.expandbtn}
      onClick={() => setIsFold(!isFold)}
    >
      <Text className={styles['fold-expand']}>{!isFold ? '展开' : '收起'}{text}</Text>
      <Icon name="RightOutlined" size="10"></Icon>
    </Button>
  );
  return (
    <>
      <View className={styles.container}>
        <View className={styles.header}>
          <View className={styles['header-right']}>
            {voteTitle}
            { isVotedEnd && <Text className={styles['header-right__text']}>（{typeText}）</Text>}
          </View>
          {!isVotedEnd && (
            <View className={styles['header-left']}>
              {voteUsers}人参与
            </View>
          )}
        </View>
        {!isVotedEnd
          && (
            <CheckboxRadio.Group defaultValue={defaultValue} className={styles.content} onChange={(val) => {
              if (isMutiple) setValue(val);
              else setValue([val]);
            }}>
              {subitems.map((item, index) => {
                if ((!isFold && index < 5) || isFold) {
                  return <CheckboxRadio key={index} name={item.id}>{item.content}</CheckboxRadio>;
                }
                return null;
              })}
              {subitems?.length > 5 && <UnfoldOrExpand text="投票" />}
            </CheckboxRadio.Group>
          )}
        {isVotedEnd && (
          <View className={styles.content}>
            {subitems.map((item, index) => {
              if ((!isFold && index < 5) || isFold) {
                const voteCount = parseInt(item.voteRate, 10) > 100 ? 100 : parseInt(item.voteRate, 10);
                return (
                  <View className={styles['result-item']} key={index}>
                    <View className={styles['result-item__header']}>
                      <View className={styles['item-header-left']}>
                        {item.content}
                        {item.isVoted && <Text className={styles.primaryText}>（已选）</Text>}
                      </View>
                      <View className={styles['item-header-right']}>
                        {item.voteCount || 0}票 {item.voteRate}
                      </View>
                    </View>
                    <Progress percent={voteCount}></Progress>
                  </View>
                );
              }
              return null;
            })}
            {/* {subitems?.length > 5 && <UnfoldOrExpand />} */}
            <Button full disabled type="primary" className={styles.disabledbtn}>
              {isExpired ? '投票已结束' : '你已投票'}（{voteUsers}人参与投票）
            </Button>
          </View>
        )}
      </View>
      {!isVotedEnd && (
        <View className={styles.footer}>
          <View className={styles.left}>
            <View className={styles['left-type']}>{typeText}</View>
            <View className={styles['left-time']}>
              <Text className={styles['time-primary']}>{day}</Text>天<Text className={styles['time-primary']}>{hour}</Text>小时<Text className={styles['time-primary']}>{minute}</Text>分
            </View>
          </View>
          <Button type="primary" className={styles.vote} onClick={handleVote}>投票</Button>
        </View>
      )}
    </>
  );
};

export default inject('thread', 'index', 'user')(observer(VoteDisplay));
