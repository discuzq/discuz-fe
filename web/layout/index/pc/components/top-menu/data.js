export default [
  {
    label: '所有', // 所有
    type: 'all',
    isActive: true,
  }, {
    label: '精华', // 精华
    type: 'essence',
    isActive: false,
  }, {
    label: '已关注', // 已关注
    type: 'attention',
    isActive: false,
  }, {
    label: '类型',
    type: 'types',
    children: [
      {
        label: '不限',
        value: '',
        isActive: true,
      },
      {
        label: '视频',
        value: '103',
        isActive: false,
      },
      {
        label: '图片',
        value: '101',
        isActive: false,
      },
      {
        label: '语音',
        value: '102',
        isActive: false,
      },
      // {
      //   label: '问答',
      //   value: '105',
      //   isActive: false,
      // },
      {
        label: '商品',
        value: '61540fef8f4de8',
        isActive: false,
      },
      {
        label: '红包',
        value: '106',
        isActive: false,
      },
      {
        label: '投票',
        value: '109',
        isActive: false,
      },
      {
        label: '悬赏问答',
        value: '107',
        isActive: false,
      },
      {
        label: '文件附件',
        value: '108',
        isActive: false,
      },
    ],
  }, {
    label: '排序', // 类型
    type: 'sort',
    isActive: false,
    children: [{
      label: '不限', // 不限
      value: '1',
      isActive: true,
    }, {
      label: '发布时间', // 发布时间
      value: '1',
      isActive: false,
    }, {
      label: '评论时间', // 更新时间
      value: '2',
      isActive: false,
    }, {
      label: '热门内容', // 更新时间
      value: '3',
      isActive: false,
    }],
  },
];
