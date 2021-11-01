import Component from './adapter';
import config from '../../../config.json';

export default class CustomIfram {
  static pluginName = config.name_en // 插件名称
  static version = config.version // 插件版本
  static author = config.author
  static platform = config.view.display.platform;
  static target = config.view.display.target // 插件使用目标
  static hookName = config.view.display.hookName // 钩子名称
  static component = <Component/> // 需要渲染的组件
  static options = {} // 需要在注入时提供的额外数据
}
