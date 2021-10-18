import htmlparser2 from 'htmlparser2';
import { getByteLen } from '../../utils';


import {
  posterFrameWidth,
  baseLineHeight,
  maxContentHeight,
  imagesGap,
  posterPadding,
  commentX,
  commentWidth,
  baseX,
  nameAndTagsY,
  avatarWidth,
  minGap,
} from '../constants';

export const getContentConfig = ({ comment }) => {
  const blocksTitle = handleTitleName(comment)
  const texts = handleTexts(comment,blocksTitle.height);
  const images =handleImagesArea(comment, texts.height, blocksTitle.height); // texts.height是：{ originalTextHeight, renderedTextHeight }
  const totalContentHeight = texts.height + images.height.renderedImgHeight + blocksTitle.height;
  const blocksBox = handleCommentBox(totalContentHeight);
  const {avatarBlock, avatarImage} = handleAvatar(comment);
  const times = handleTimes(comment,totalContentHeight);

  const returnConfig = {
    height: totalContentHeight + 50,
    config: {
      blocks: [...blocksBox.blocks],
      texts: [...blocksTitle.texts, ...texts.texts , ...times.texts],
      images: [...images.images],
    },
  }
  if(!comment.user.avatar || comment.isAnonymous) {
    returnConfig.config.blocks.push(avatarBlock);
  } else {
    returnConfig.config.images.push(avatarImage);
  }

  return returnConfig;
};

// 处理头像
const handleAvatar = (comment) => {
  const avatar = comment.user.avatar || ''
  let avatarBlock = {};
  let avatarImage = {};
  if(!avatar || comment.isAnonymous) {
    avatarBlock = getAvatarBlock(comment);
  } else {
    avatarImage = getAvatarImage(comment);
  }
  return {
    avatarBlock,
    avatarImage
  }
}

// 处理头像
const getAvatarBlock = (comment) => {
  let {nickname} = comment.user
  if(comment.isAnonymous) {
    nickname = '匿'
  }
  const name = nickname.charAt(0)
  return {
    x: baseX,
    y: nameAndTagsY,
    width: avatarWidth,
    height: 76,
    borderRadius: 76,
    borderColor: '#000',
    backgroundColor: '#8590a6',
    text: {
      text: name,
      color: '#fff',
      fontSize: 28,
      lineHeight: 28,
      textAlign: 'center',
      baseLine: 'middle',
      zIndex: 10,
      fontFamily: 'PingFang SC',
      width: avatarWidth - minGap * 6,
    },
    zIndex: 10,
  }
}

// 处理头像
const getAvatarImage = (comment) => {
    const avatar = comment.user.avatar || ''
    return {
        url: avatar,
        x: baseX,
        y: nameAndTagsY,
        width: avatarWidth,
        height: avatarWidth,
        borderRadius: 76,
        borderColor: '#000',
        zIndex: 10,
    }
}

const handleCommentBox = totalContentHeight =>({
    height: totalContentHeight,
    blocks: [
      {
        x: commentX,
        y: 25,
        width: commentWidth,
        height: totalContentHeight,
        backgroundColor: '#f5f7f8',
        borderRadius: 10,
      },
    ],
  })

const handleTimes = (comment,totalContentHeight) =>({
    height: 40,
    texts: [
      {
        text: comment.createdAt,
        x: commentX,
        y: totalContentHeight + 40,
        width: comment.createdAt.length*26,
        fontSize: 24,
        lineHeight: baseLineHeight,
        lineNum: 1,
        textAlign: 'left',
        zIndex: 10,
        baseLine: 'top',
        color: '#8590a6',
        fontFamily: 'PingFang SC',
      },
    ],
  })

const handleTitleName = comment =>{
  const nickname = comment.user?.nickname;
  let groupname = comment.user?.groups?.name;
  groupname = groupname.length>7? `${groupname.slice(0,7)}...`:groupname;
  const titleY = 50;
  return {
    height: 60,
    texts: [
      // 内容
      {
        text: nickname,
        x: baseX+commentX,
        y: titleY,
        width: nickname.length*26,
        fontSize: 26,
        lineHeight: baseLineHeight,
        lineNum: 1,
        textAlign: 'left',
        zIndex: 10,
        baseLine: 'top',
        color: '#000',
        fontFamily: 'PingFang SC',
        fontWeight:'bold',
      },
      {
        text: groupname,
        x: baseX+commentX + nickname.length*26 + 10,
        y: titleY,
        width: groupname.length*32,
        fontSize: 26,
        lineHeight: baseLineHeight,
        lineNum: 1,
        textAlign: 'left',
        zIndex: 10,
        baseLine: 'top',
        color: '#8590a6',
        fontFamily: 'PingFang SC',
      },
    ],
  }
}



const handleTexts = (comment, titleHeight) => {
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


  parse.parseComplete(comment.content);
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
        x: baseX+commentX,
        y: titleHeight+50,
        width: commentWidth-45,
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

const handleImagesArea = (comment, textHeight , titleHeight) => {
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
        width: commentWidth-45,
        height: item.height,
        y: imageY + titleHeight,
        x: baseX+commentX,
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


