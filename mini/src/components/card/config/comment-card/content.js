import s9e from '@common/utils/s9e';
import replaceStringInRegex from '@common/utils/replace-string-in-regex';
import htmlparser2 from 'htmlparser2';
import { getByteLen } from '../../utils';



import {
  posterFrameWidth,
  baseLineHeight,
  maxContentHeight,
  imagesGap,
  posterPadding,
  commentWidth,
  baseX,
  contentWidth,
} from '../constants';

export const getContentConfig = ({ comment , baseHeight }) => {
  const texts = handleTexts(comment,baseHeight);
  const images =handleImagesArea(comment, texts.height, baseHeight); // texts.height是：{ originalTextHeight, renderedTextHeight }
  const totalContentHeight = baseHeight+ texts.height + images.height.renderedImgHeight 

  const returnConfig = {
    height: totalContentHeight + 50,
    config: {
      texts: [ ...texts.texts,],
      images: [...images.images],
    },
  }
  return returnConfig;
};




const handleTexts = (comment, baseHeight) => {
  const content =[];
  const { Parser } = htmlparser2;
  const parse = new Parser({
    ontext(text) {
      content.push(text);
    },
    onclosetag(tagname) {
      // 处理换行
      if (tagname === 'br') {
        content.push('\n');
      }
    },
  });

  let commentText = s9e.parse(comment.content);
  commentText = replaceStringInRegex(commentText, 'code', '');
  commentText = replaceStringInRegex(commentText, 'img', '');

  parse.parseComplete(commentText);
  const contentStr = content.join('');

  // 统计有几个换行
  const n = contentStr.length - contentStr.replace(/[\n]/g, '').length - 1;
  // 计算文本高度,计算有多少文字乘以文字宽度最后除以一行的宽度,再乘以一行的高度52
  const contentHeight = (Math.ceil((getByteLen(contentStr) * 14) / commentWidth) + (n >= 0 ? n : 0)) * baseLineHeight;
  console.log(contentHeight,111)
  return {
    height: contentHeight,
    texts: [
      // 内容
      {
        text: content.join(''),
        x: baseX,
        y: baseHeight,
        width: contentWidth,
        fontSize: 32,
        lineHeight: baseLineHeight,
        lineNum: parseInt(contentHeight / baseLineHeight),
        textAlign: 'left',
        zIndex: 10,
        baseLine: 'top',
        color: '#0B0B37',
        fontFamily: 'PingFang SC',
      },
    ],
  };
};

const handleImagesArea = (comment, textHeight , baseHeight) => {
  let renderedImgHeight = 0;

  const images = [];
  let imgInfo = {};
  // 图片区域，返回一组图片url集合
  imgInfo = handleImage(comment, textHeight);

  if (imgInfo?.imagesArray) {
    const {imagesArray} = imgInfo;
    for (let i = 0; i < imagesArray.length; i++) {
      const item = imagesArray[i];
      if (!item.url || item.url.match(/.gif|.webp/gi)) continue;

      const imageY =
        textHeight +
        renderedImgHeight +
        imagesGap + 20;

      const image = {
        url: item.url,
        width: contentWidth,
        height: item.height,
        y: imageY + baseHeight,
        x: baseX,
        borderRadius: 12,
        zIndex: 10,
      };

      renderedImgHeight += item.height + imagesGap;
      images.push(image);
    }
  }

  renderedImgHeight += baseLineHeight; // 图片底部增加一行高度

  const imagesHeight = { originalImageHeight: imgInfo.sumOfFilesHeight || 0, renderedImgHeight };

  return {
    height: imagesHeight,
    images: [
      // 图片
      ...images,
    ],
  };
};




// 处理图片，返回一组图片url和高度的集合
const handleImage = (comment, contentHeight) => {
  let imgArray = [];
  // 处理付费或无内容时的图片
  imgArray = comment.images;
  const imagesArray = [];
  const availableImageSpace = maxContentHeight - contentHeight;

  let sumOfFilesHeight = 0; // 根据帖子中的图片高度计算渲染多少个图，用于减少访问数量
  for (let i = 0; i < imgArray.length; i++) {
    const item = imgArray[i];
    const fileHeight =
      (item?.fileHeight || 0) * ((commentWidth - posterPadding * 2 - posterFrameWidth) / (item?.fileWidth || 0));

    if (item?.url.match(/.gif|.webp/gi)) continue; // 暂不支持gif和webp
    sumOfFilesHeight += fileHeight;
    if (sumOfFilesHeight <= availableImageSpace || i === 0) { // 超过最大长度的图片不需要处理，第一个图片是超长也需要
        imagesArray.push({
          height: fileHeight,
          url: item?.url || "",
        });
    }

  }

 

  return {
    sumOfFilesHeight,
    imagesArray,
  };
};


