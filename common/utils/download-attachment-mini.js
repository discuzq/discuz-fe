/**
 * url 下载链接
 * fileName 文件名称
 * isSave 是否保存到本地
 */
 import locals from '@common/utils/local-bridge';
 import constants from '@common/constants';
 import Taro from '@tarojs/taro';

// 用于发送下载请求后端记录下载次数
export const downloadAttachmentMini = (url) => {
  // 下载附件时请求头authorization需要携带上登录态
  const accessToken = locals.get(constants.ACCESS_TOKEN_NAME);

  Taro.request({
    url: url,
    method: 'GET',
    dataType: 'blob',
    header: {
      'authorization': `Bearer ${accessToken}`
    },
    success: (res) => {
      console.log(res);
    },
    fail: (err) => {
      console.log(err);
    }
  });
};
