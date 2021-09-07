import Component from './adapter';
import config from './config.json';

export default class CustomIframPost {
    static pluginName = config.pluginName // 插件名称
    static version = config.version // 插件版本
    static target = config.target // 插件使用目标
    static hookName = config.hookName // 钩子名称
    static platform = config.platform;
    static component = <Component/> // 需要渲染的组件
    static options = {} // 需要在注入时提供的额外数据
}