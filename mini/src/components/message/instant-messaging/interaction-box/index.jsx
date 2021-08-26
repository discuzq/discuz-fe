import React, { useState, useEffect } from 'react';
import { View } from '@tarojs/components';
import Button from '@discuzq/design/dist/components/button/index';
import Icon from '@discuzq/design/dist/components/icon/index';
import Input from '@discuzq/design/dist/components/input/index';
import Toast from '@discuzq/design/dist/components/toast/index';

import { Emoji } from '@components/thread-post';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';

const InteractionBox = (props) => {
  const { forum, showEmoji, switchEmoji, chooseImage, typingValue, setTypingValue, doSubmitClick } = props;
  const { otherPermissions, setOtherPermissions } = forum;
  const { disabledChat = false } = otherPermissions || {};

  const [cursorPosition, setCursorPosition] = useState(0);

  const insertEmoji = (emoji) => {
    const text = typingValue.slice(0, cursorPosition) + emoji.code + typingValue.slice(cursorPosition);
    setTypingValue(text);
    setCursorPosition(cursorPosition + emoji.code.length);
  };

  useEffect(() => {
    !otherPermissions && setOtherPermissions();
  }, [])

  return (
    <View id='operation-box' className={styles.interactionBox}>
      <View className={styles.operationBox}>
        <View className={styles.inputWrapper}>
          <Input
            placeholderClass={styles.placeholderClass}
            cursorSpacing={16}
            cursor={cursorPosition}
            value={typingValue}
            placeholder={disabledChat ? ' 私信已被禁用' : ' 请输入内容'}
            disabled={disabledChat}
            onChange={(e) => {
              setTypingValue(e.detail.value);
              setCursorPosition(e.detail.cursor);
            }}
            onBlur={(e) => {
              setCursorPosition(e.detail.cursor);
            }}
          />
          <View className={styles.tools}>
            <View>
              <Icon name="SmilingFaceOutlined" size={20} color={'var(--color-text-secondary)'} onClick={() => {
                if (disabledChat) {
                  return Toast.info({ content: `私信已被禁用` });
                }
                switchEmoji(!showEmoji);
              }} />
            </View>
            <View className={styles.pictureUpload}>
              <Icon name="PictureOutlinedBig" size={20} color={'var(--color-text-secondary)'} onClick={() => {
                if (disabledChat) {
                  return Toast.info({ content: `私信已被禁用` });
                }
                chooseImage();
              }} />
            </View>
          </View>
        </View>
        <View className={styles.submit}>
          <Button className={styles.submitBtn} type="primary" disabled={disabledChat} onClick={doSubmitClick}>
            发送
          </Button>
        </View>
      </View>
      <View className={styles['emoji-container']}>
        <Emoji show={showEmoji} onClick={insertEmoji} />
      </View>
    </View>
  );
};

export default inject('forum')(observer(InteractionBox));
