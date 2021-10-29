import React from 'react';
import { View, Text } from '@tarojs/components';
import { Input } from '@discuzq/design';
import actEntryStyles from '../../../entry/adapter/index.module.scss';
import { ATTACH_INFO_TYPE, ATTACH_INFO_NAME } from '@common/plugin/custom-apply/client/common';
import { debounce } from '@common/utils/throttle-debounce';

export default class CustomApplyAttach extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      additionalInfo: {},
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.activityId !== prevProps.activityId) {
      this.setState({ additionalInfo: {} });
    }
  }

  handleAttachInfoChange = (e, item) => {
    const { key } = ATTACH_INFO_NAME[item?.toString()] || {};
    if (!key) return;
    const { additionalInfo } = this.state;
    additionalInfo[key] = e.target.value;
    this.setState({ additionalInfo }, () => {
      this.props.onChange(this.state.additionalInfo);
    });
  };

  render() {
    const { additionalInfo } = this.state;
    const { renderData } = this.props;
    const { body } = renderData || {};
    const { additionalInfoType = [] } = body || {};
    return (additionalInfoType || []).map(item => (<View className={actEntryStyles['dzqp-act--item']}>
      <View className={actEntryStyles['dzqp-act--item_title']} key={item}>
        {ATTACH_INFO_NAME[item?.toString()]?.value}
      </View>
      <View className={actEntryStyles['dzqp-act--item_right']}>
        <Input
          key={item}
          className={actEntryStyles['dzqp-act--item_right']}
          miniType={item === ATTACH_INFO_TYPE.mobile ? 'number' : 'text'}
          mode={item === ATTACH_INFO_TYPE.mobile ? 'number' : 'text'}
          placeholder={`请输入${ATTACH_INFO_NAME[item?.toString()]?.value}`}
          maxLength={50}
          value={additionalInfo[ATTACH_INFO_NAME[item?.toString()]?.key] || ''}
          onChange={debounce(e => this.handleAttachInfoChange(e, item?.toString()), 400)}
        />
      </View>
    </View>));
  }
}
