import React, { createRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Input, Toast, Divider, Button, Icon } from '@discuzq/design';
import styles from './index.module.scss';
import { readEmoji } from '@common/server';
import Avatar from '@components/avatar';
import Emoji from '@components/editor/emoji';
import classnames from 'classnames';
import { inject } from 'mobx-react';

const CommentInput = inject('site')(inject('user')((props) => {
  const { onSubmit, onClose, height, initValue = '', placeholder = '写下我的评论...', platform = 'pc', userInfo } = props;

  const textareaRef = createRef();

  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const [placeholderState, setPlaceholder] = useState('');

  const [emojis, setEmojis] = useState([]);
  const [showEmojis, setShowEmojis] = useState(false);

  const [cursorPos, setCursorPos] = useState(0);

  const canSubmit = useMemo(() => !!value, [value]);

  useEffect(() => {
    setPlaceholder(placeholder);
  }, [placeholder]);

  useEffect(() => {
    setValue(initValue);
  }, [initValue]);

  // 点击其他地方emoji输入框收起
  useEffect(() => {
    showEmojis ? window.addEventListener('click', onEventClick) : window.removeEventListener('click', onEventClick);

    return () => {
      window.removeEventListener('click', onEventClick);
    };
  }, [showEmojis]);

  const onEventClick = useCallback((e) => {
    e && e.stopPropagation();
    if (e.target.id === 'emojiBtn') {
      // setShowEmojis(!showEmojis);
      return;
    }
    setCursorPos(0);
    setShowEmojis(false);
  }, []);

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
    if (typeof props.onEmojiIconClick === 'function' && !props.onEmojiIconClick()) {
      return;
    }

    setCursorPos(0);
    setShowEmojis(!showEmojis);

    // 请求表情地址
    if (!emojis?.length) {
      const ret = await readEmoji();
      const { code, data = [] } = ret;
      if (code === 0) {
        setEmojis(data.map((item) => ({ code: item.code, url: item.url })));
      }
    }
  };

  // 完成选择表情
  const onEmojiClick = (emoji) => {
    // 在光标位置插入
    let insertPosition = 0;
    if (cursorPos === 0) {
      insertPosition = textareaRef?.current?.selectionStart || 0;
    } else {
      insertPosition = cursorPos;
    }
    const newValue = value.substr(0, insertPosition) + (emoji.code || '') + value.substr(insertPosition);
    setValue(newValue);
    setCursorPos(insertPosition + emoji.code.length);

    // setShowEmojis(false);
  };

  const onFocus = (e) => {
    typeof props.onFocus === 'function' && props.onFocus(e);
  };

  const style = {
    maxWidth: '100%',
    boxSizing: 'border-box',
  };

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <Avatar
          isShowUserInfo={!props.hideInfoPopip && props.platform === 'pc'}
          userId={userInfo.id}
          circle={true}
          image={userInfo.avatarUrl}
          name={userInfo.nickname || ''}
          onClick={(e) => props.onClick && props.onClick(e)}
          unifyOnClick={props.unifyOnClick}
          platform={props.platform}>
        </Avatar>

        <Input
          className={`${styles.input}`}
          maxLength={5000}
          showLimit={false}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholderState}
          disabled={loading}
          ref={textareaRef}
          onFocus={onFocus}
        ></Input>
      </div>


      <div className={styles.footer}>
        {showEmojis && <Emoji style={style} pc show={showEmojis} emojis={emojis} onClick={onEmojiClick} atTop={false} />}

        <div className={styles.linkBtn}>
          <Icon
            name="SmilingFaceOutlined"
            size="20"
            className={classnames(styles.btnIcon, showEmojis && styles.actived)}
            onClick={onEmojiIconClick}
            id="emojiBtn"
          ></Icon>
        </div>

        <Button
          loading={loading}
          disabled={!canSubmit}
          onClick={onSubmitClick}
          className={styles.button}
          type="primary"
          size="large"
        >
          评论
        </Button>
      </div>
    </div>
  );
}));

export default CommentInput;
