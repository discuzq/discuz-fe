import React, { createRef, useEffect, useState, useCallback, useMemo } from 'react';
import { View } from '@tarojs/components'
import Input from '@discuzq/design/dist/components/input';
import Button from '@discuzq/design/dist/components/button';
import Icon from '@discuzq/design/dist/components/icon';
import { readEmoji } from '@common/server';
import Avatar from '@components/avatar';
import Emoji from '@components/emoji';
import classnames from 'classnames';
import { inject } from 'mobx-react';
import styles from './index.module.scss';

const CommentInput = inject('site')(inject('user')((props) => {
  const { onSubmit, onClose, height, initValue = '', placeholder = '写下我的评论...', platform = 'pc', userInfo, emojihide } = props;

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

  useEffect(() => {
    if (emojihide) setShowEmojis(false);
  }, [emojihide]);

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
        // 发布成功隐藏表情
        setShowEmojis(false);
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

  return (
    <View className={styles.container}>
      <View className={styles.main}>
        <Avatar
          isShowUserInfo={!props.hideInfoPopip && props.platform === 'pc'}
          userId={userInfo?.id}
          circle={true}
          image={userInfo?.avatarUrl}
          name={userInfo?.nickname || ''}
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
      </View>


      <View className={styles.footer}>
        {showEmojis && <View className={styles.emojis}><Emoji show={showEmojis} emojis={emojis} onClick={onEmojiClick}/></View>}

        <View className={styles.linkBtn}>
          <Icon
            name="SmilingFaceOutlined"
            size="20"
            className={classnames(styles.btnIcon, showEmojis && styles.actived)}
            onClick={onEmojiIconClick}
            id="emojiBtn"
          ></Icon>
        </View>

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
      </View>
    </View>
  );
}));

export default CommentInput;
