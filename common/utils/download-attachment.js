/**
 * url 下载链接
 * fileName 文件名称
 * isSave 是否保存到本地
 */
 import locals from '@common/utils/local-bridge';
 import constants from '@common/constants';
 import Taro from '@tarojs/taro';

const downloadAttachment = (url, fileName, isSave = true) => {
  // 下载附件时请求头authorization需要携带上登录态
  const accessToken = locals.get(constants.ACCESS_TOKEN_NAME);

  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);        
  xhr.setRequestHeader("authorization",`Bearer ${accessToken}`);
  xhr.responseType = "blob"; // 返回类型blob
  xhr.send(); // 发送请求
  xhr.onload = () => { // 请求完成
    if (xhr.status === 200 && isSave) {
      const blob = xhr.response;
      const reader = new FileReader();
      reader.readAsDataURL(blob); // 转换为base64，可以直接放入a的href
      reader.onload = (e) => {
        let a = document.createElement('a'); // 创建一个a标签用于下载
        a.download = fileName; // 文件名
        a.href = e.target.result;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    }
  };
};

// 用于发送下载请求后端记录下载次数
const downloadAttachmentMini = (url) => {
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

export { downloadAttachment, downloadAttachmentMini };