import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { inject, observer } from 'mobx-react';
import { Icon, RichText, ImagePreviewer } from '@discuzq/design';
import { noop } from '../utils';
import classnames from 'classnames';

import fuzzyCalcContentLength from '@common/utils/fuzzy-calc-content-length';
import s9e from '@common/utils/s9e';
import xss from '@common/utils/xss';
import { urlToLink } from '@common/utils/replace-url-to-a';
import replaceStringInRegex from '@common/utils/replace-string-in-regex';

import styles from './index.module.scss';

/**
 * 帖子内容展示
 * @prop {string}   content 内容
 * @prop {boolean}  useShowMore 是否需要"查看更多"
 * @prop {function} onRedirectToDetail 跳转到详情页面，当点击内容或查看更多内容超出屏幕时跳转到详情页面
 * @prop {function} onOpen 内容展开事件
 */

const PostContent = ({
  content,
  useShowMore = true, // 是否需要"查看更多"
  onRedirectToDetail = noop,
  customHoverBg = false,
  usePointer = true,
  onOpen = noop,
  updateViewCount = noop,
  transformer = parsedDom => parsedDom,
  ...props
}) => {
  // 内容是否超出屏幕高度
  const [contentTooLong, setContentTooLong] = useState(false); // 超过1200个字符
  const [cutContentForDisplay, setCutContentForDisplay] = useState('');
  const [showMore, setShowMore] = useState(false); // 根据文本长度显示"查看更多"
  const [imageVisible, setImageVisible] = useState(false);
  const [imageUrlList, setImageUrlList] = useState([]);
  const [curImageUrl, setCurImageUrl] = useState("");
  const ImagePreviewerRef = useRef(null); // 富文本中的图片也要支持预览
  const contentWrapperRef = useRef(null);

  const texts = {
    showMore: '查看更多',
  };

  // 过滤内容
  const filterContent = useMemo(() => {
    let newContent = content ? s9e.parse(content) : '';
    newContent = xss(newContent);
    return newContent;
  }, [content]);

  // 点击"查看更多"
  const onShowMore = useCallback(
    (e) => {
      e && e.stopPropagation();
      updateViewCount();
      if (contentTooLong) {
        // 内容过长直接跳转到详情页面
        onRedirectToDetail && onRedirectToDetail();
      } else {
        onOpen();
        setShowMore(false);
      }
    },
    [contentTooLong],
  );

  // 点击帖子
  const handleClick = (e) => {
    if (e.target.localName === 'a') {
      return;
    }
    e && e.stopPropagation();
    // 点击图片不跳转，图片不包含表情
    if (!(e?.target?.getAttribute('src') && e?.target?.className?.indexOf('qq-emotion') === -1)) {
      onRedirectToDetail();
    }
  };

  // 显示图片的预览
  useEffect(() => {
    if (imageVisible && ImagePreviewerRef && ImagePreviewerRef.current) {
      ImagePreviewerRef.current.show();
    }
  }, [imageVisible]);

  // 点击富文本中的图片
  const handleImgClick = (e) => {
    updateViewCount();
    if (e?.attribs?.src) {
      setImageVisible(true);
      setCurImageUrl(e.attribs.src);
    }
  };

  // 点击富文本中的链接
  const handleLinkClick = () => {
    updateViewCount();
    setTimeout(() => { // 等待store更新完成后跳转
    }, 500);
  };

  // 超过1200个字符，截断文本用于显示
  const getCutContentForDisplay = (maxContentLength) => {
    const ctn = filterContent;
    let ctnSubstring = ctn.substring(0, maxContentLength); // 根据长度截断

    const cutPoint = ctnSubstring.lastIndexOf('<img') > 0 ? ctnSubstring.lastIndexOf('<img') : ctnSubstring.length;

    ctnSubstring = ctnSubstring.substring(0, cutPoint);
    setCutContentForDisplay(ctnSubstring);
  };

  const getImagesFromText = (text) => {
    const _text = replaceStringInRegex(text, "emoj", '');
    const images = _text.match(/<img\s+[^<>]*src=[\"\'\\]+([^\"\']*)/gm) || [];

    for(let i = 0; i < images.length; i++) {
      images[i] = images[i].replace(/<img\s+[^<>]*src=[\"\'\\]+/gm, "") || "";
    }
    return images;
  }

  useEffect(() => {
    const lengthInLine = parseInt((contentWrapperRef.current.offsetWidth || 704) / 16);
    const length = fuzzyCalcContentLength(filterContent, lengthInLine); // 大致计算文本长度
    const maxContentLength = lengthInLine * 6; // 如果默认长度是704，一共可容纳264个字符

    if (length < maxContentLength && length <= 1200) {
      // 显示6行内容
      setShowMore(false);
    } else {
      // 超过6行
      setShowMore(true);
    }
    if (length > 1200) { // 超过一页的超长文本
      if (useShowMore) getCutContentForDisplay(1200);
      setContentTooLong(true);
    } else {
      setContentTooLong(false);
    }

    const imageUrlList = getImagesFromText(filterContent);
    if(imageUrlList.length) {
      setImageUrlList(imageUrlList);
    }

  }, [filterContent]);

  return (
    <div className={classnames(styles.container, usePointer ? styles.usePointer : '')} {...props}>
      <div
        ref={contentWrapperRef}
        className={`${styles.contentWrapper} ${(useShowMore && showMore) ? styles.hideCover : ''} ${customHoverBg ? styles.bg : ''}`}
        onClick={showMore ? onShowMore : handleClick}
      >
        <div className={styles.content}>
          <RichText
            content={useShowMore && cutContentForDisplay ? cutContentForDisplay : urlToLink(filterContent)}
            onClick={handleClick}
            onImgClick={handleImgClick}
            onLinkClick={handleLinkClick}
            transformer={transformer}
            iframeWhiteList={['bilibili', 'youku', 'iqiyi', 'music.163.com', 'qq.com']}
          />
          {imageVisible && (
            <ImagePreviewer
              ref={ImagePreviewerRef}
              onClose={() => {
                setImageVisible(false);
              }}
              imgUrls={imageUrlList}
              currentUrl={curImageUrl}
            />
          )}
        </div>
      </div>
      {useShowMore && showMore && (
        <div className={styles.showMore} onClick={onShowMore}>
          <div className={styles.hidePercent}>{texts.showMore}</div>
          <Icon className={styles.icon} name="RightOutlined" size={12} />
        </div>
      )}
    </div>
  );
};

export default React.memo(PostContent);
