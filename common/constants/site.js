/**
 * 站点配置的一些变量
 * 包括 ../config 下面的基础配置
 */
import initEnvConfig from '@common/config';
// 环境配置
export const ENV_CONFIG = initEnvConfig();

// 应用主题
export const APP_THEME = {
  light: 'light',
  dark: 'dark',
};

// web端站点加入路由白名单
export const WEB_SITE_JOIN_WHITE_LIST = [
  '/user/login', // 登录中转
  '/user/wx-auth', // 登录中转
  '/user/phone-login', // 手机登录
  '/user/username-login', // 用户名登录
  '/user/wx-login', // 微信登录
  '/user/wx-authorization', // 微信授权
  '/user/wx-bind', // 微信绑定
  '/user/wx-bind-phone', // 微信绑定手机号
  '/user/wx-bind-qrcode', // 扫码绑定微信
  '/user/wx-bind-username', // 微信用户名绑定
  '/user/wx-select', // 微信落地页
  '/user/register', // 注册
  '/user/status', // 状态
  '/user/supplementary', // 补充信息
  '/user/reset-password', // 找回密码
  '/user/agreement', // 协议
  '/user/bind-phone', // 绑定手机号
  '/user/bind-nickname', // 绑定昵称
  '/my', // 个人中心
  '/forum/partner-invite', // 站点加入
];

// mini端站点加入路由白名单
export const MINI_SITE_JOIN_WHITE_LIST = [
  '/subPages/user/wx-auth/index', // 快捷登录
  '/subPages/user/wx-select/index', // 微信落地页
  '/subPages/user/bind-phone/index', // 绑定手机号
  '/subPages/user/status/index', // 状态
  '/subPages/user/wx-bind/index', // 小程序绑定
  '/subPages/user/wx-authorization/index', // 微信授权
  '/subPages/user/wx-bind-username/index', // 用户名绑定
  '/subPages/user/wx-bind-phone/index', // 绑定手机号
  '/subPages/user/supplementary/index', // 补充信息
  '/subPages/my/index', // 个人中心
  '/subPages/forum/partner-invite/index', // 站点加入
];

export const PERMISSION_PLATE = [
  '插入图片',
  '插入视频',
  '插入语音',
  '插入附件',
  '插入商品',
  '插入付费',
  '插入悬赏',
  '插入红包',
  '插入位置',
  '允许匿名',
  '查看主题列表',
  '查看主题详情',
  '免费查看付费内容',
  '回复主题',
  '加精',
  '编辑主题',
  '删除主题',
  '删除回复',
  '编辑自己的主题',
  '删除自己的主题或回复',
]

export const COMMON_PERMISSION = [
  '置顶',
  '收藏帖子',
  '点赞帖子',
  '查看用户信息',
  '关注/取关用户',
  '发布私信',
  '裂变推广(邀请加入)',
  '发布帖子时需要验证码',
  '发布帖子时需要绑定手机',
  '申请提现',
  '创建订单',
  '支付订单'
]