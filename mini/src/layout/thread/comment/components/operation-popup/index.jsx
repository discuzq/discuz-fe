import React from 'react';
import ActionSheet from '@discuzq/design/dist/components/action-sheet/index';
import styles from './index.module.scss';

const OperationPop = (props) => {
  const { visible, onCancel, onOperationClick } = props;

  const onSelect = (e, item) => {
    typeof onOperationClick === 'function' && onOperationClick(item.key);
  }

  const actionsColumn = [
    {
      content: '回复',
      key: 'reply'
    },
    {
      content: '复制',
      key: 'copy'
    },
    {
      content: '举报',
      key: 'report'
    }];


  return (
    <ActionSheet
      className={styles.main}
      onSelect={(e, item) => onSelect(e, item)}
      visible={visible}
      actions={actionsColumn}
      onClose={() => onCancel()}
    />
  );
};

export default OperationPop;