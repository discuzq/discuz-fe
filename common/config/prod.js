module.exports = {
  TITLE: DISCUZ_CONFIG_TITLE,
  COMMON_BASE_URL: process.env.DISCUZ_ENV === 'web' ? process.env.DISCUZ_RUN === 'ssr' ? DISCUZ_CONFIG_HOST : '' : DISCUZ_CONFIG_HOST,
};
