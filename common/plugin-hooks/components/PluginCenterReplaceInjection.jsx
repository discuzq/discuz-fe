let PluginCenterReplaceInjection = () => {};

if (process.env.DISCUZ_ENV === 'mini') {
  const DZQPluginCenterReplaceInjection = require('@discuzq/plugin-center/dist/components/DZQPluginCenterReplaceInjection');
  PluginCenterReplaceInjection = DZQPluginCenterReplaceInjection.default;
}

if (process.env.DISCUZ_ENV === 'web') {
  const DZQPluginCenterReplaceInjection = require('../../../web/utils/DZQPluginCenterReplaceInjectionPolyfill');
  PluginCenterReplaceInjection = DZQPluginCenterReplaceInjection.default;
}

export default PluginCenterReplaceInjection;
