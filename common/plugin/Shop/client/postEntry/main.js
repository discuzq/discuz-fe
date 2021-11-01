import Component from './adapter';
import config from '../config.json';

export default class ShopPostEntry {
  static pluginName = config.name_en // 插件名称
  static version = config.version // 插件版本
  static target = config.view.postEntry.target // 插件使用目标
  static hookName = config.view.postEntry.hookName // 钩子名称
  static platform = config.view.postEntry.platform;
  static component = <Component/> // 需要渲染的组件
  static options = {
    tomId: '61540fef8f4de8',
  } // 需要在注入时提供的额外数据
}
