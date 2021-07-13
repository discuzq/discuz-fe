// import Taro from '@tarojs/taro';

let storage = null;
const isMini = process.env.DISCUZ_ENV === 'mini';

export default class Storage {
  constructor({ storageType }) {

    if(!isMini) {
      const isBrowser = typeof window !== 'undefined';
      if(storageType === "local") {
        storage = isBrowser ? window.localStorage : {};
      } else {
        storage = isBrowser ? window.sessionStorage : {};
      }
    }

  }


  /**
   * 设置数据项
   * @param {string} key 键
   * @param {any} value 值
   */
  set(key, value) {
    try {
      if(isMini) {
        // Taro.setStorageSync(key, value)
      } else {
        storage.setItem(key, value);
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * 得到数据项
   * @param {string} key 键
   */
  get(key) {
    try {
      if(isMini) {
        // Taro.getStorageSync(key)
      } else {
        return storage.getItem(key);
      }
    } catch (error) {
      console.error(error);
    }
  }
}