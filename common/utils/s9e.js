/* eslint-disable */
// <p>&lt;p&gt;111&lt;/p&gt;</p>
import getConfig from '@common/config';
import Storage from '@common/utils/session-storage';

export const tags = {
  topic: text => {
    if (!text) return;
    const regexp = /<span\s*id="topic"\s*value="(?<value>\w+)"\s*>(?<string>[^<]+)<\/span>/gimu;
    return text.replace(regexp, match => {
      return match.replace(regexp, (content, value, text) => {
        const href = `/topic/topic-detail/${value}`;
        return `<a href="${href}" class="content-topic a-blue">${text}</a> `;
      });
    });
  },
  usermention: text => {
    if (!text) return;
    const regexp = /<span\s*id="member"\s*value="(?<value>\w+)"\s*>(?<string>[^<]+)<\/span>/gimu;
    return text.replace(regexp, match => {
      return match.replace(regexp, (content, value, text) => {
        const href = `/user/${value}`;
        return `<a href="${href}" class="content-member a-blue">${text}</a> `;
      });
    });
  },

  parseHtml1: text => { // 恢复 <
    if (!text) return;
    const regexp = /&lt;/gimu;
    return text.replace(regexp, match => {
      return match.replace(regexp, (content, value, text) => {
        return `<`;
      });
    });
  },
  parseHtml2: text => {  // 恢复 >
    if (!text) return;
    const regexp = /&gt;/gimu;
    return text.replace(regexp, match => {
      return match.replace(regexp, (content, value, text) => {
        return `>`;
      });
    });
  },
  emotion: (text, emojis) => {  // 转义表情
    if (!text) return '';
    const regexp = /:(?<value>[A-Za-z]{2,20}):/gimu;
    return text.replace(regexp, match => {
      return match.replace(regexp, (content, value, text) => {
        const { code, url, isAllow } = handleEmoji(value, emojis)
        if (isAllow) {
          return `<img style="display:inline-block;vertical-align:top" src="${url}" alt="${code}" class="qq-emotion">`;
        }

        return `:${value}:`
      });
    });
  },
};

//fixby hechongwei 添加是否有代码块标识isCode，如果有，过滤掉html转移 http://bug.eims.com.cn/bug-view-3099.html
function parse(text) {
  const isCode = text.indexOf('<pre><code>') >= 0;

  for (const tag in tags) {
    if (isCode && (tag === 'parseHtml1' || tag === 'parseHtml2')) {
      return text
    }

    if (tag === 'emotion') {
      const storage = new Storage({ storageType: 'local' })
      const emojis = JSON.parse(storage.get('DZQ_EMOJI') || `{}`);
      text = tags[tag](text, emojis);
    } else {
      text = tags[tag](text);
    }
  }

  return text;
}

const handleEmoji = (value, emojis) => {
  const config = getConfig() || {}
  const url = config.COMMON_BASE_URL || window.location.origin

  if (!emojis?.length) {
    return {
      code: value,
      url: `${url}/emoji/qq/${value}.gif`,
      isAllow: true
    }
  }

  const emoji = emojis.filter(item => item.code === `:${value}:`).map(item => {
    return {
      code: value,
      url: item.url,
      isAllow: true
    }
  })

  if (emoji?.length) {
    return emoji[0]
  } else {
    return { isAllow: false }
  }

}

export default { parse };
