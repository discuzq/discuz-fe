/**
 * 发帖页 - 底部选项框
 */
import React, { memo } from 'react';
import ActionSheet from '@discuzq/design/dist/components/action-sheet/index';
import PropTypes from 'prop-types';

const PaidTypePopup = ({ show, list, onClick, onHide }) => {
  const actions = [];
  list.map((item) => {
    actions.push({ content: item.name, type: item.type });
  });
  const onSelect = (e, item) => {
    onClick({name: item.content, type: item.type})
  }
  return (
    <ActionSheet
      actions={actions}
      onSelect={onSelect}
      visible={show}
      onClose={onHide}
    >
    </ActionSheet>
    // <Popup
    //   className={styles.wrapper}
    //   visible={show}
    //   position="bottom"
    //   maskClosable
    //   onClose={onHide}
    // >
    //   <View className={styles.content}>
    //     {list.map(item => (
    //       <View className={styles.item} key={item} onClick={() => onClick(item)}>
    //         {item.name}
    //       </View>
    //     ))}
    //     <View className={styles.btn} onClick={onHide}>取消</View>
    //   </View>
    // </Popup>
  );
};

PaidTypePopup.propTypes = {
  show: PropTypes.bool.isRequired,
  list: PropTypes.array,
  onClick: PropTypes.func,
  onHide: PropTypes.func,
};

PaidTypePopup.defaultProps = {
  show: false,
  list: [],
  onClick: () => { },
  onHide: () => { },
};

export default memo(PaidTypePopup);
