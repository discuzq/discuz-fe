import { THREAD_TYPE, ACCEPT_VIDEO_TYPES, ATTACHMENT_TYPE } from '@common/constants/thread-post';

// 商品链接分析页的图标
export const goodImages = [
  {
    src: '/dzq-img/jingdong.svg',
    name: '京东',
    width: 20,
    height: 20,
  },
  {
    src: '/dzq-img/taobao.svg',
    name: '淘宝',
    width: 20,
    height: 20,
  },
  {
    src: '/dzq-img/tmall.svg',
    name: '天猫',
    width: 20,
    height: 20,
  },
  {
    src: '/dzq-img/pinduoduo.svg',
    name: '拼多多',
    width: 20,
    height: 20,
  },
  {
    src: '/dzq-img/youzan.svg',
    name: '有赞',
    width: 20,
    height: 20,
  },
];

export const defaultOperation = {
  emoji: 'emoji',
  at: 'at',
  topic: 'topic',
  attach: 'attach',
  redpacket: 'redpacket',
  pay: 'pay',
};

const activeColor = '#2469f6';

/**
 * 默认的操作栏 icon
 */
export const defaultIcon = [
  {
    name: 'SmilingFaceOutlined', // emoji
    // active: activeColor, // 这3个图标永远不需要上颜色
    id: defaultOperation.emoji,
    type: THREAD_TYPE.emoji,
  },
  {
    name: 'AtOutlined', // @
    // active: activeColor,
    id: defaultOperation.at,
    type: THREAD_TYPE.at,
  },
  {
    name: 'SharpOutlined', // #
    // active: activeColor,
    id: defaultOperation.topic,
    type: THREAD_TYPE.topic,
  },
  {
    name: 'PaperClipOutlined', // 附件
    active: activeColor,
    id: defaultOperation.attach,
    type: THREAD_TYPE.file,
  },
  {
    name: 'RedPacketOutlined', // 红包
    active: activeColor,
    id: defaultOperation.redpacket,
    type: THREAD_TYPE.redPacket,
  },
  {
    name: 'GoldCoinOutlined', // 付费
    active: activeColor,
    id: defaultOperation.pay,
    menu: [
      {
        id: 'threadpay',
        name: '帖子付费',
      },
      {
        id: 'attachpay',
        name: '附件付费',
      },
    ],
    type: THREAD_TYPE.paid,
  },
];

export const attachIcon = [
  {
    name: 'PictureOutlinedBig',
    active: activeColor,
    type: THREAD_TYPE.image,
  },
  {
    name: 'VideoOutlined',
    active: activeColor,
    type: THREAD_TYPE.video,
    isUpload: true,
    limit: 1,
    accept: ACCEPT_VIDEO_TYPES.join(','),
    data: {
      type: ATTACHMENT_TYPE.video,
    },
  },
  {
    name: 'MicroOutlined',
    active: activeColor,
    type: THREAD_TYPE.voice,
  },
  {
    name: 'ShoppingCartOutlined',
    active: activeColor,
    type: THREAD_TYPE.goods,
  },
  {
    name: 'QuestionOutlined',
    active: activeColor,
    type: THREAD_TYPE.reward,
  },
  {
    name: 'MenuOutlined',
    active: activeColor,
    type: THREAD_TYPE.vote,
  },
  {
    name: 'AnonymityOutlined',
    active: activeColor,
    type: THREAD_TYPE.anonymity,
  },
];

// 发帖底部付费选项
export const paidOption = [
  {
    name: '帖子付费',
    type: THREAD_TYPE.paidPost,
  },
  {
    name: '附件付费',
    type: THREAD_TYPE.paidAttachment,
  },
];

// 发帖底部草稿选项
export const draftOption = [
  {
    name: '保存草稿',
    type: THREAD_TYPE.saveDraft,
  },
  {
    name: '不保存',
    type: THREAD_TYPE.abandonDraft,
  },
];
