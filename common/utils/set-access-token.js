import locals from './local-bridge';
import constants from '../constants/index';

export const setCookie = (name, value, exdays) => {
    let cookie = name + "=" + value + ";";
    if (exdays) {
      let d = new Date();
      d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
      let expires = "expires=" + d.toGMTString();
      cookie = cookie + ' ' + expires;
    }
    document.cookie = cookie;
}

export const getCookie = (cname) => {
    let name = cname + "=";
    let cookie = document.cookie.split(';');
    for(let i = 0, len = cookie.length; i < len; i++) {
      let c = cookie[i].trim();
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

const setAccessToken = ({
    accessToken
}) => {
    const expireSeconds = 30 * 24 * 60 * 60 * 1000;
    setCookie(constants.ACCESS_TOKEN_NAME, accessToken, 30);
    locals.set(constants.ACCESS_TOKEN_NAME, accessToken, expireSeconds);
}

export default setAccessToken;