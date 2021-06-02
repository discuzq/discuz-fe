/**
 * 针对给出的请求实例进行本地化配置
 */
import { apiIns } from '@discuzq/sdk/dist/api';
import typeofFn from '@common/utils/typeof';
import setAuthorization from '@common/utils/set-authorization';
import setUserAgent from '@common/utils/set-user-agent';
import { ENV_CONFIG } from '@common/constants/site';
import isServer from '@common/utils/is-server';
import Toast from '@discuzq/design/dist/components/toast';
import Router from '@discuzq/sdk/dist/router';
let globalToast = null;
const api = apiIns({
  baseURL: ENV_CONFIG.COMMOM_BASE_URL && ENV_CONFIG.COMMOM_BASE_URL !== '' ? ENV_CONFIG.COMMOM_BASE_URL : isServer() ? '' : window.location.origin,
  timeout: isServer() ? 2000 : 0,
});

const { http } = api;

// 处理数据异常，当数据为空对象或空数组，都将统一返回null
function reasetData(data) {
  if (!data) return null;
  if (typeofFn.isArray(data)) {
    if (data.length === 0) {
      return null;
    }
    return data;
  }
  return typeofFn.isEmptyObject(data) ? null : data;
}

// 请求拦截
http.interceptors.request.use(
  // 设置userAgent
  // 设置请求头
  (config) => {
    // eslint-disable-next-line no-param-reassign
    config = setUserAgent(config);
    const requestData = setAuthorization(config);
    return requestData;
  },
  (error) => {
    // 对请求错误做些什么
    console.error('request', error);
    if ( globalToast ) {
      globalToast.hide();
      globalToast = null;
    }
    globalToast = Toast.error({
      title: '请求错误',
      content: err.message || '未知错误',
    });
    return {
      code: -1,
      data: null,
      msg: '请求发生错误',
    };
  },
);

// 响应结果进行设置
http.interceptors.response.use((res) => {
  const { data } = res;
  // 如果4002将重定向到登录
  // if (data.Code === -4002) {
  //   Router.redirect({url: '/user/login'});
  // }
  return Promise.resolve({
    code: data.Code,
    data: reasetData(data.Data),
    msg: data.Message,
  });
}, (err) => {
  if (window) {
    console.error('response', err.stack);
    console.error('response', err.message);
    if ( globalToast ) {
      globalToast.hide();
      globalToast = null;
    }
    globalToast = Toast.error({
      title: '接口错误',
      content: err.message || '未知错误',
    });
  }
  return Promise.resolve({
    code: -1,
    data: null,
    msg: '网络发生错误',
  });
});

export default api;
