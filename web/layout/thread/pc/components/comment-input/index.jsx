import React, { createRef, useEffect, useState } from 'react';
import { Textarea, Toast, Upload, Button, Icon } from '@discuzq/design';
import styles from './index.module.scss';
import { readEmoji } from '@common/server';

import Emoji from '@components/editor/emoji';
import AtSelect from '@components/thread-detail-pc/at-select';
import TopicSelect from '@components/thread-post/topic-select';

import classnames from 'classnames';

const CommentInput = (props) => {
  const { onSubmit, onClose, height, initValue = '', placeholder = '写下我的评论...' } = props;

  const textareaRef = createRef();

  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const [placeholderState, setPlaceholder] = useState('');

  const [emojis, setEmojis] = useState([]);

  const [showEmojis, setShowEmojis] = useState(false);
  const [showAt, setShowAt] = useState(false);
  const [showTopic, setShowTopic] = useState(false);

  useEffect(() => {
    setPlaceholder(placeholder);
  }, [placeholder]);

  useEffect(() => {
    setValue(initValue);
  }, [initValue]);

  const onSubmitClick = async () => {
    if (typeof onSubmit === 'function') {
      try {
        setLoading(true);
        const success = await onSubmit(value);
        if (success) {
          setValue('');
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const onEmojiIconClick = async () => {
    setShowEmojis(!showEmojis);
    setShowAt(false);

    // 请求表情地址
    if (!emojis?.length) {
      const ret = await readEmoji();
      const { code, data = [] } = ret;
      if (code === 0) {
        setEmojis(data.map((item) => ({ code: item.code, url: item.url })));
      }
    }
  };

  const onAtIconClick = () => {
    setShowAt(!showAt);
    setShowEmojis(false);
  };

  const onTopicIconClick = () => {
    setShowTopic(!showTopic);
    setShowEmojis(false);
    setShowAt(false);
  };

  // 完成选择表情
  const onEmojiClick = (emoji) => {
    // 在光标位置插入
    const insertPosition = textareaRef?.current?.selectionStart || 0;
    const newValue = value.substr(0, insertPosition) + (emoji.code || '') + value.substr(insertPosition);
    setValue(newValue);

    setShowEmojis(false);
  };

  // 完成选择@人员
  const onAtListChange = (atList) => {
    // 在光标位置插入
    const atListStr = atList.map((atUser) => ` @${atUser} `).join('');
    const insertPosition = textareaRef?.current?.selectionStart || 0;
    const newValue = value.substr(0, insertPosition) + (atListStr || '') + value.substr(insertPosition);
    setValue(newValue);

    setShowEmojis(false);
  };

  // 完成选择话题
  const onTopicClick = (topic) => {
    // 在光标位置插入
    const insertPosition = textareaRef?.current?.selectionStart || 0;
    const newValue = value.substr(0, insertPosition) + (topic ? ` ${topic} ` : '') + value.substr(insertPosition);
    setValue(newValue);

    setShowTopic(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <Textarea
          className={`${styles.input} ${height === 'label' ? styles.heightLabel : styles.heightMiddle}`}
          rows={5}
          showLimit={true}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholderState}
          disabled={loading}
          forwardedRef={textareaRef}
        ></Textarea>
      </div>

      {showAt && <AtSelect pc visible={showAt} getAtList={onAtListChange} onCancel={onAtIconClick} />}

      {showTopic && (
        <TopicSelect pc visible={showTopic} cancelTopic={() => setShowTopic(false)} clickTopic={onTopicClick} />
      )}

      <div className={styles.footer}>
        {showEmojis && <Emoji pc show={showEmojis} emojis={emojis} onClick={onEmojiClick} />}

        <div className={styles.linkBtn}>
          <Icon
            name="SmilingFaceOutlined"
            size="20"
            className={classnames(styles.btnIcon, showEmojis && styles.actived)}
            onClick={onEmojiIconClick}
          ></Icon>
          <Icon
            name="AtOutlined"
            size="20"
            className={classnames(styles.btnIcon, showAt && styles.actived)}
            onClick={onAtIconClick}
          ></Icon>
          <Icon
            name="SharpOutlined"
            size="20"
            className={classnames(styles.btnIcon, showTopic && styles.actived)}
            onClick={onTopicIconClick}
          ></Icon>
        </div>
        <Button loading={loading} onClick={onSubmitClick} className={styles.button} type="primary" size="large">
          发布
        </Button>
      </div>
    </div>
  );
};

export default CommentInput;
