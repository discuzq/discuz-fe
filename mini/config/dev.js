const getDefinePlugin = require('@discuzq/cli/config/taro/getDefinePlugin');
const getDZQPluginLoader = require('@discuzq/cli/config/taro/getDZQPluginLoader');
const path = require('path');

module.exports = {
  env: {
    NODE_ENV: '"development"',
  },
  mini: {
    miniCssExtractPluginOption: {
      ignoreOrder: true
    },
    webpackChain(chain, webpack) {
      const defaultDefinePlugin = getDefinePlugin();
      chain.plugin()
        .use(webpack.DefinePlugin, [
          {
            ...defaultDefinePlugin
          }
        ]
      )
      getDZQPluginLoader(chain);
    },
    commonChunks: ['runtime', 'vendors', 'taro', 'common'],
  },
  h5: {},
};
