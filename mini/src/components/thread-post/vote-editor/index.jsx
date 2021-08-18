import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import Radio from '@discuzq/design/dist/components/radio/index';
import Input from '@discuzq/design/dist/components/input/index';
import Button from '@discuzq/design/dist/components/button/index';
import Icon from '@discuzq/design/dist/components/icon/index';
import DateTimePicker from '../date-time-picker';
import { formatDate } from '@common/utils/format-date';
import { observer, inject } from 'mobx-react';
import styles from './index.module.scss';




// import React, { useState, useEffect } from 'react';
// import { Radio, Button, Input, Toast, Icon } from '@discuzq/design';
// import { inject, observer } from 'mobx-react';
// import styles from './index.module.scss';
// import DDialog from '@components/dialog';
// import DatePicker from 'react-datepicker';
// import DatePickers from '@components/thread/date-picker'
// import { formatDate } from '@common/utils/format-date';

const Index = ({ threadPost }) => {

  const data = JSON.parse(JSON.stringify(threadPost.postData));
  const initSubitems = [{
    id: 0,
    content: '',
  }, {
    id: 0,
    content: '',
  }];

  const hasVoteData = data?.vote?.voteTitle;

  const [subitems, setSubitems] = useState(hasVoteData ? data.vote.subitems : initSubitems);
  const [title, setTitle] = useState(hasVoteData ? data.vote.voteTitle : '');
  const [type, setType] = useState(hasVoteData ? data.vote.choiceType : 1);
  const [time, setTime] = useState(hasVoteData ? data.vote.expiredAt : formatDate(new Date(new Date().getTime() + 60 * 60 * 1000), 'yyyy/MM/dd hh:mm'));
  const [show, setShow] = useState(false);

  const cancel = () => {
    Taro.navigateBack();
  };

  const vote = () => {
    let subitemsCopy = [...subitems];
    subitemsCopy = subitemsCopy.filter(item => {
      return !!item.content;
    });

    if (!title) {
      Toast.info({ content: '标题不能为空' });
      return;
    }

    if (subitemsCopy.length < 2) {
      Toast.info({ content: '至少需要提供两个有效选项' });
      return;
    }

    threadPost.setPostData({
      vote: {
        voteId: '',
        voteTitle: title,
        choiceType: type,
        expiredAt: formatDate(time, 'yyyy/MM/dd hh:mm:ss'),
        subitems: subitems,
      }
    });
    cancel();
  };

  const content = (
    <>
      <View className={styles.wrapper} onClick={e => e.stopPropagation()}>

        <View className={styles['reward-item']}>
          <Text className={styles.left}>标题</Text>
          <View className={styles.right}>
            <Input
              value={title}
              miniType="digit"
              mode="text"
              placeholder="标题最多支持25个字"
              maxLength={25}
              onChange={e => setTitle(e.target.value.trim().substr(0, 25))}
            />
          </View>
        </View>

        <View className={styles['reward-item']}>
          <Text className={styles.left} style={{width: '400rpx'}}>
            <Text>投票选项</Text>
            <Text className={styles.tips}>最多支持20个字</Text>
          </Text>
        </View>

        {subitems.map((item, index) => (
          <View className={styles['reward-item']}>
            <Text className={styles.left}>{`${index + 1}.`}</Text>
            <View className={styles.right}>
              <Input
                value={item.content}
                miniType="digit"
                mode="text"
                maxLength={20}
                onChange={e => {
                  const arr = [...subitems];
                  arr[index].content = e.target.value.trim().substr(0, 20);
                  setSubitems(arr);
                }}
              />

              {/* 删除选项按钮 */}
              <Icon
                style={{visibility: subitems.length > 2 ? 'visible' : 'hidden'}}
                name="DeleteOutlined"
                className={styles['delete-icon']}
                onClick={(e) => {
                  const arr = [...subitems];
                  arr.splice(index, 1);
                  setSubitems(arr);
                }}
              />
            </View>
          </View>
        ))}

        <View className={`${styles['reward-item']} ${styles['add-btn']}`}>
          <Button
            style={{visibility: subitems.length < 20 ? 'visible' : 'hidden'}}
            onClick={() => {
              const arr = [...subitems];
              arr.push({
                id: 0,
                content: '',
              });
              setSubitems(arr);
            }}>
            添加选项
          </Button>
        </View>

        <View className={styles['reward-item']}>
          <Text className={styles.left}>投票方式</Text>
          <View className={styles.right}>
            <Radio.Group value={type} onChange={item => setType(item)}>
              <Radio name={1}>单选</Radio>
              <Radio name={2}>多选</Radio>
            </Radio.Group>
          </View>
        </View>

        <View className={styles['reward-item']}>
          <Text className={styles.left}>结束时间</Text>
          <View className={styles.right}>
            <View
              // className={classNames(
              //   styles['selected-time'],
              //   !times && styles['default-time']
              // )}
              onClick={() => {}}
            >
              {time || '请选择悬赏时间'}
            </View>
            <View className={styles['time-arrow']}>
              <Icon name="RightOutlined" size={10} />
            </View>
          </View>
        </View>

        {/* 时间选择弹框 */}
        <DateTimePicker
          // ref={this.timeRef}
          onConfirm={() => {}}
          initValue={() => {}}
          wrap-class="my-class"
          select-item-class="mySelector"
        />

      </View>
      {/* 按钮 */}
      <View className={styles.btn}>
        <Button onClick={cancel}>取消</Button>
        <Button className={styles['btn-confirm']} onClick={vote}>发起投票</Button>
      </View>
    </>
  );


  return content;
};

export default inject('threadPost')(observer(Index));