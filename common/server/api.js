/**
 * 针对给出的请求实例进行本地化配置
 */
import { apiIns } from '@discuzq/sdk/dist/api';
import typeofFn from '@common/utils/typeof';
import setAuthorization from '@common/utils/set-authorization';
import setUserAgent from '@common/utils/set-user-agent';
import isServer from '@common/utils/is-server';
import Toast from '@discuzq/design/dist/components/toast';
import Router from '@discuzq/sdk/dist/router';
import { handleError } from '@discuzq/sdk/dist/api/utils/handle-error';
import clearLoginStatus from '@common/utils/clear-login-status';
import {
  ENV_CONFIG,
  INVALID_TOKEN,
  JUMP_TO_404,
  JUMP_TO_LOGIN,
  JUMP_TO_REGISTER,
  JUMP_TO_AUDIT,
  JUMP_TO_REFUSE,
  JUMP_TO_DISABLED,
  JUMP_TO_HOME_INDEX,
  SITE_CLOSED,
  JUMP_TO_PAY_SITE,
  SITE_NO_INSTALL,
  JUMP_TO_SUPPLEMENTARY,
  OPERATING_FREQUENCY
} from '@common/constants/site';

let globalToast = null;
const api = apiIns({
  baseURL: ENV_CONFIG.COMMON_BASE_URL && ENV_CONFIG.COMMON_BASE_URL !== '' ? ENV_CONFIG.COMMON_BASE_URL : isServer() ? '' : window.location.origin,
  timeout: isServer() ? 2000 : 0,
  // 200 到 504 状态码全都进入成功的回调中
  validateStatus(status) {
    return status >= 200 && status <= 504;
  },
  // 控制全局的 toast，默认都显示，如果不需要显示的 api，需要在对应的 api 请求参数中带上这个参数并设置为 false
  isShowToast: true,
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
  const { data, status, statusText } = res;
  // 如果4002将重定向到登录
  // if (data.Code === -4002) {
  //   Router.redirect({url: '/user/login'});
  // }
  let url = null;
  switch (data.Code) {
    case INVALID_TOKEN: {
      // @TODO 未登陆且无权限时，直接跳转加入页面。可能影响其它逻辑
      // 通过res?.config?.headers?.authorization获取用户的token判断是否登陆
      // 未登陆时，帖子列表接口返回无权限，跳转登陆
      if (!res?.config?.headers?.authorization && ~res?.config?.url.indexOf('/thread.list')) {
        if (process.env.DISCUZ_ENV === 'web') {
          url = '/user/login';
        } else {
          url = '/subPages/user/wx-auth/index';
        }
        Router.push({
          url
        });
      }
      break;
    }
    case JUMP_TO_404: {
      if (process.env.DISCUZ_ENV === 'web') {
        url = '/404';
      } else {
        url = '/subPages/404/index'
      }
      Router.replace({
        url
      });
      break;
    }
    case JUMP_TO_LOGIN: {
      clearLoginStatus();
      if (process.env.DISCUZ_ENV === 'web') {
        window.location.replace('/user/login');
      } else {
        url = '/subPages/user/wx-auth/index'
      }
      Router.replace({
        url
      });
      break;
    }
    case JUMP_TO_REGISTER: {
      clearLoginStatus();
      if (process.env.DISCUZ_ENV === 'web') {
        window.location.replace('/user/register');
      } else {
        url = '/subPages/user/wx-auth/index'
      }
      Router.replace({
        url
      });
      break;
    }
    case JUMP_TO_AUDIT: {
      if (process.env.DISCUZ_ENV === 'web') {
        url = '/user/status?statusCode=2';
      } else {
        url = '/subPages/user/status/index?statusCode=2'
      }
      Router.push({
        url
      });
      break;
    }
    case JUMP_TO_REFUSE: {
      if (process.env.DISCUZ_ENV === 'web') {
        url = '/user/status?statusCode=-4007';
      } else {
        url = '/subPages/user/status/index?statusCode=-4007'
      }
      Router.push({
        url
      });
      break;
    }
    case JUMP_TO_DISABLED: {
      if (process.env.DISCUZ_ENV === 'web') {
        url = '/user/status?statusCode=-4009';
      } else {
        url = '/subPages/user/status/index?statusCode=-4009'
      }
      Router.push({
        url
      });
      break;
    }
    case JUMP_TO_HOME_INDEX: {
      if (process.env.DISCUZ_ENV === 'web') {
        url = '/';
      } else {
        url = '/pages/home/index'
      }
      Router.replace({
        url
      });
      break;
    }
    case SITE_CLOSED: {
      if (process.env.DISCUZ_ENV === 'web') {
        url = '/close';
      } else {
        url = '/subPages/close/index'
      }
      Router.replace({
        url
      });
      break;
    }
    case JUMP_TO_PAY_SITE: {
      if (process.env.DISCUZ_ENV === 'web') {
        url = '/forum/partner-invite';
      } else {
        url = '/subPages/forum/partner-invite/index'
      }
      Router.push({
        url
      });
      break;
    }
    case SITE_NO_INSTALL: {
      if (process.env.DISCUZ_ENV === 'web') {
        url = '/no-install';
      } else {
        url = '/subPages/no-install/index'
      }
      Router.replace({
        url
      });
      break;
    }
    case JUMP_TO_SUPPLEMENTARY: {
      if (process.env.DISCUZ_ENV === 'web') {
        url = '/user/supplementary';
      } else {
        url = '/subPages/user/supplementary/index';
      }
      Router.push({
        url
      });
      break;
    }
    case OPERATING_FREQUENCY: {
      Toast.error({
        content: '操作太频繁，请稍后重试',
      });
    }
    default:  // 200 状态码
      if (status === 200) {
        return Promise.resolve({
          code: data.Code,
          data: reasetData(data.Data),
          msg: data.Message,
        });
      }
  }
  return Promise.resolve({
    code: status,
    data: null,
    msg: statusText,
  });
}, (err) => {
  const { isShowToast = true } = err?.config;
  if (window) {
    console.error('response', err.stack);
    console.error('response', err.message);
    if ( globalToast ) {
      globalToast.hide();
      globalToast = null;
    }
    globalToast = isShowToast && Toast.error({
      title: '接口错误',
      content: err.message || '未知错误',
    });
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
