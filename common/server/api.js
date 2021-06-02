/**
 * 针对给出的请求实例进行本地化配置
 */
import { apiIns } from '@discuzq/sdk/dist/api';
import typeofFn from '@common/utils/typeof';
import setAuthorization from '@common/utils/set-authorization';
import setUserAgent from '@common/utils/set-user-agent';
import { ENV_CONFIG } from '@common/constants/site';
import isServer from '@common/utils/is-server';
import Router from '@discuzq/sdk/dist/router';
import { handleError } from '@discuzq/sdk/dist/api/utils/handle-error';

const api = apiIns({
  baseURL: ENV_CONFIG.COMMOM_BASE_URL && ENV_CONFIG.COMMOM_BASE_URL !== '' ? ENV_CONFIG.COMMOM_BASE_URL : isServer() ? '' : window.location.origin,
  timeout: isServer() ? 2000 : 0,
  // 200 到 504 状态码全都进入成功的回调中
  validateStatus(status) {
    return status >= 200 && status <= 504;
  },
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
    return {
      code: -1,
      data: null,
      msg: '请求发生错误',
    };
  },
);

// 响应结果进行设置
http.interceptors.response.use((res) => {
  const { data, status, statusText } = res;
  // 如果4002将重定向到登录
  // if (data.Code === -4002) {
  //   Router.redirect({url: '/user/login'});
  // }
  // 200 状态码
  if (status === 200) {
    return Promise.resolve({
      code: data.Code,
      data: reasetData(data.Data),
      msg: data.Message,
    });
  }
  return Promise.resolve({
    code: status,
    data: null,
    msg: statusText,
  });
}, (err) => {
  if (window) {
    console.error('response', err.stack);
    console.error('response', err.message);
  }
  // 超时的错误处理，超时的状态码是 -500
  const { Code, Message } = handleError(err);
  return Promise.resolve({
    code: Code,
    data: null,
    msg: Code === -1 ? '网络发生错误' : Message,
  });
});

export default api;
