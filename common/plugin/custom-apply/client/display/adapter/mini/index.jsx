import React from 'react';
import { inject, observer } from 'mobx-react';
import { View, Text } from '@tarojs/components';
import { Button, Icon, Avatar, Toast } from '@discuzq/design';
import PopupList from '@components/thread/popup-list';
import CountDown from '@common/utils/count-down';
import LoginHelper from '@common/utils/login-helper';
import classNames from 'classnames';
import styles from '../index.module.scss';

let countDownIns = null;

class CustomApplyDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isDetailPage: props.dzqRouter.router.Current.router.path.indexOf('/indexPages/thread/index') > -1,
      popupShow: false,
      loading: false,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isApplyEnd: false, // 报名时间是否已结束
      isApplyStart: false, // 报名时间是否已开始
    };
    this.handleActOperate = this.handleActOperate.bind(this);
    this.createRegister = this.createRegister.bind(this);
    this.deleteRegister = this.deleteRegister.bind(this);
  }

  componentDidMount() {
    if (!countDownIns) countDownIns = new CountDown();

    const { renderData } = this.props;
    const { body } = renderData || {};
    if (body?.registerEndTime || body?.registerStartTime) {
      const start = body?.registerStartTime?.replace(/-/g, '/');
      const time = body?.registerEndTime?.replace(/-/g, '/');

      if (new Date().getTime() < new Date(start).getTime()) {
        countDownIns.start(start, (res) => {
          const { days, hours, minutes, seconds } = res;
          this.setState({ minutes, seconds, days, hours });
          if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
            this.setState({ isApplyStart: true });
            this.applyStartCountDown(time);
          }
        });
      } else {
        this.setState({ isApplyStart: true });
        this.applyStartCountDown(time);
      }
    }
  }

  componentWillUnmount() {
    if (!countDownIns) countDownIns?.stop();
  }

  // 取消报名
  async deleteRegister(opt) {
    try {
      const { params = {}, data = {}, ...others } = opt;
      const options = {
        url: '/plugin/activity/api/register/cancel', // 请求地址
        method: 'POST',
        params,
        data,
        ...others
      };
      const result = await this.props.dzqRequest.dispatcher(options);
      return result;
    } catch (error) {
      return this.props.dzqRequestHandleError(error);
    }
  }
  // 确认报名
  async createRegister(opt) {
    try {
      const { params = {}, data = {}, ...others } = opt;
      const options = {
        url: '/plugin/activity/api/register/append', // 请求地址
        method: 'POST',
        params,
        data,
        ...others
      };
      const result = await this.props.dzqRequest.dispatcher(options);
      return result;
    } catch (error) {
      return this.props.dzqRequestHandleError(error);
    }
  }

  applyStartCountDown = (time) => {
    countDownIns.start(time, (res) => {
      const { days, hours, minutes, seconds } = res;
      // const ms = (days * 24 * 60) + (hours * 60) + minutes;
      this.setState({ minutes, seconds, days, hours });
      if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
        this.setState({ isApplyEnd: true });
        countDownIns?.stop();
      }
    });
  };

  getUserCls = (users = []) => {
    if (users.length >= 3) return styles.three;
    if (users.length === 2) return styles.two;
    if (users.length === 1) return styles.one;
  };

  getActStatusText = () => {
    const { body } = this.props.renderData || {};
    const { isApplyEnd, isApplyStart } = this.state;
    if (!isApplyStart) return '报名未开始';
    if (body?.isMemberFull) return '人数已满';
    if (isApplyEnd) return '报名已结束';
  };

  handleActOperate = async () => {
    const { renderData, userInfo, isLogin, threadData, updateThread, updateListThreadIndexes, recomputeRowHeights } = this.props;
    if (!isLogin()) {
      LoginHelper.saveAndLogin();
      return;
    }
    const { tomId, body, _plugin } = renderData || {};
    const { isRegistered, activityId, registerUsers, totalNumber } = body;
    const action = isRegistered ? this.deleteRegister : this.createRegister;
    this.setState({ loading: true });
    const res = await action({ data: { activityId } });
    this.setState({ loading: false });
    if (res.code === 0) {
      const authorInfo = userInfo;
      const uid = authorInfo.id;
      const users = registerUsers.filter(item => item.userId !== uid);
      let currentNumber = body?.currentNumber;
      // 没有报名
      if (!isRegistered) {
        users.unshift({
          userId: uid,
          avatar: authorInfo.avatarUrl,
          nickname: authorInfo.nickname,
        });
        currentNumber = body?.currentNumber + 1;
      } else {
        currentNumber = body?.currentNumber - 1;
      }
      const tid = this.state.isDetailPage ? threadData?.id : threadData?.threadId;
      const tomValue = {
        body: {
          ...body,
          isRegistered: !isRegistered,
          registerUsers: users,
          currentNumber,
          isMemberFull: currentNumber === totalNumber && totalNumber > 0,
        },
        tomId,
        threadId: tid,
        _plugin,
      };
      updateThread(tomId, tomValue);
      const newThreadData = updateListThreadIndexes(tid, tomId, tomValue);
      if (newThreadData && recomputeRowHeights) recomputeRowHeights(newThreadData);
      Toast.info({ content: isRegistered ? '取消报名成功' : '报名成功' });
    } else Toast.error({ content: res.msg || '报名失败' });
    return res;
  };

  handleMoreClick = () => {
    const { dzqRouter, threadData } = this.props;
    const tid = this.state.isDetailPage ? threadData?.id : threadData?.threadId;
    if (tid) {
      dzqRouter.push({ url: `/indexPages/thread/index?id=${tid}` });
    }
  };

  render() {
    const { siteData, renderData } = this.props;
    const { isApplyEnd, minutes, seconds, days, hours, isApplyStart } = this.state;
    if (!renderData) return null;
    const { body } = renderData || {};
    const { isRegistered } = body;
    // 过期 || 已满 || 结束 || 未开始
    const isCanNotApply = body?.isExpired || body?.isMemberFull || isApplyEnd || !isApplyStart;

    const { popupShow } = this.state;
    return (
      <>
        <View className={classNames(styles.wrapper, styles.h5)}>
          <View className={styles['wrapper-header']}>
            <View className={styles['wrapper-header__left']}>
              {body?.title && body?.title}
            </View>
            <View className={styles['wrapper-header__right']}>
              {!isApplyEnd && (
                <>
                  还有
                  <Text className={styles['text-primary']}>{days}</Text>天
                  <Text className={styles['text-primary']}>{hours}</Text>小时
                  <Text className={styles['text-primary']}>{minutes}</Text>分
                  <Text className={styles['text-primary']}>{seconds}</Text>秒
                  {isApplyStart ? '结束报名' : '开始报名'}
                </>
              )}
              {isApplyEnd && (
                <>
                  报名已结束
                </>
              )}
            </View>
          </View>
          <View className={styles['wrapper-content']}>
            {body?.content && (
              <>
                <View className={
                  classNames(styles['wrapper-content__detail'], {
                    [styles['text-clamp']]: !this.state.isDetailPage,
                  })
                }>
                  {body?.content}
                </View>
                {!this.state.isDetailPage && (
                  <View
                    className={classNames(styles['text-primary'], styles.more)}
                    onClick={this.handleMoreClick}
                  >查看详情></View>
                )}
              </>
            )}
            <View className={classNames(styles['wrapper-content__tip'], styles.mt4n)}>
              <Icon name="TimeOutlined" size="12" />
              <View className={styles['wrapper-tip__content']}>
                <Text className={styles['wrapper-tip_title']}>活动时间</Text>
                <Text className={styles['wrapper-tip_detail']}>
                  {body?.activityStartTime} ~ {body?.activityEndTime}
                </Text>
              </View>
            </View>
            {body?.position?.location && (
              <View className={styles['wrapper-content__tip']}>
                <Icon name="PositionOutlined" size="12" />
                <View className={styles['wrapper-tip__content']}>
                  <Text className={styles['wrapper-tip_title']}>活动地址</Text>
                  <Text className={styles['wrapper-tip_detail']}>{body?.position?.location}</Text>
                </View>
              </View>
            )}
            {body?.totalNumber !== 0 && (
              <View className={styles['wrapper-content__limit']}>
                限<Text className={styles['text-primary']}>{body?.totalNumber}</Text>人参与
              </View>
            )}
          </View>
          <View className={styles['wrapper-footer']}>
            <View className={styles['wrapper-footer__top']}>
              <View
                className={classNames(styles.users, this.getUserCls(body?.registerUsers || []))}
                onClick={() => this.setState({ popupShow: true })}
              >
                {(body?.registerUsers || []).map((item, index) => {
                  if (index <= 2) return <Avatar circle={true} size="small" text={item.nickname} image={item.avatar} key={item.nickname} />;
                  return null;
                })}
                <Text className={styles.m10}>{body?.currentNumber}人已报名</Text>
              </View>
              {(!isCanNotApply || isRegistered) && (
                <Button
                  type="primary"
                  loading={this.state.loading}
                  className={classNames(styles.applybtn, {
                    [styles.isregisterd]: isRegistered,
                  })}
                  onClick={this.handleActOperate}
                >
                  {isRegistered ? '取消报名' : '立即报名'}
                </Button>
              )}
            </View>
            {isCanNotApply && <Button full disabled className={styles.donebtn}>{this.getActStatusText()}</Button>}
          </View>
        </View>
        {popupShow && <PopupList
          isCustom
          activityId={body?.activityId}
          visible={popupShow}
          onHidden={() => this.setState({ popupShow: false })}
          tipData={{ platform: siteData.platform }}
        />}
      </>
    );
  }
};

export default CustomApplyDisplay;
