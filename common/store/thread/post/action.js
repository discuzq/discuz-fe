import { action } from 'mobx';
import ThreadPostStore from './store';
import { readEmoji, readFollow, readProcutAnalysis, readTopics, createThread, updateThread, createThreadVideoAudio, readPostCategories } from '@common/server';
import { LOADING_TOTAL_TYPE, THREAD_TYPE, THREAD_STATUS } from '@common/constants/thread-post';
import { emojiFromEditFormat, emojiFormatForCommit } from '@common/utils/emoji-regexp';
import { formatDate } from '@common/utils/format-date';
import { initPostData } from './common';
import { tags as s9e } from '@common/utils/s9e';

class ThreadPostAction extends ThreadPostStore {
  /**
   * 发帖
   * @param {boolean} isMini 是否是来自小程序
   */
  @action.bound
  async createThread(isMini) {
    const params = this.getCreateThreadParams(false, isMini);
    const ret = await createThread(params);
    if (ret.code === 0) this.currentSelectedToolbar = false;
    return ret;
  }

  /**
   * 更新帖子
   * @param {number} id 帖子id
   * @param {boolean} isMini 是否是来自小程序
   */
  @action.bound
  async updateThread(id, isMini) {
    const params = this.getCreateThreadParams(true, isMini);
    const ret = await updateThread({ ...params, threadId: Number(id) });
    return ret;
  }

  @action.bound
  async readPostCategory(id) {
    const params = id ? { threadId: id } : {};
    const ret = await readPostCategories({ params });
    if (ret.code === 0) this.categories = ret.data || [];
    return ret;
  }

  /**
   * 创建视频音频
   */
  @action.bound
  async createThreadVideoAudio(params) {
    const ret = await createThreadVideoAudio(params);
    return ret;
  }

  /**
   * 获取所有表情
   */
  @action.bound
  async fetchEmoji() {
    this.setLoadingStatus(LOADING_TOTAL_TYPE.emoji, true);
    const ret = await readEmoji();
    this.setLoadingStatus(LOADING_TOTAL_TYPE.emoji, false);
    const { code, data = [] } = ret;
    let emojis = [];
    if (code === 0) emojis = data.map(item => ({ code: item.code, url: item.url }));
    this.setEmoji(emojis);
    return ret;
  }

  /**
   * 获取关注列表 [有些参数觉得没有必要，在这里没有列举出来]
   * @param {object} options 参数
   * @param {number} options.page 页码
   * @param {number} options.perPage 每页数据条数
   * @param {number} [default=1] options.filter.type 不传或者 0：所有；1：我的关注；2：我的粉丝
   */
  @action.bound
  async fetchFollow(options = {}) {
    const { filter = {}, page = 1, ...others } = options;
    const params = {
      perPage: 20,
      ...others,
      filter: {
        type: 1,
        ...filter,
      },
      page,
    };
    this.setLoadingStatus(LOADING_TOTAL_TYPE.follow, true);
    const ret = await readFollow({ params });
    this.setLoadingStatus(LOADING_TOTAL_TYPE.follow, false);
    const { code, data } = ret;
    const { pageData, totalCount = 0 } = data || {};
    if (code === 0) {
      if (page === 1) this.setFollow(pageData || [], totalCount);
      else this.appendFollow(pageData || [], totalCount);
    }
    return ret;
  }

  /**
   * 根据商品贴的商品链接获取到商品信息
   * @param {object} options 参数
   * @param {address} options.address 商品链接
   */
  @action.bound
  async fetchProductAnalysis(options = {}) {
    this.setLoadingStatus(LOADING_TOTAL_TYPE.product, true);
    const ret = await readProcutAnalysis({ data: options });
    const { code, data = {} } = ret;
    if (code === 0) this.setProduct(data);
    this.setLoadingStatus(LOADING_TOTAL_TYPE.product, false);
    return ret;
  }

  @action.bound
  async fetchTopic(options = {}) {
    this.setLoadingStatus(LOADING_TOTAL_TYPE.topic, true);
    const params = {
      page: 1,
      perPage: 20,
      ...options,
    };
    const ret = await readTopics({ params });
    const { code, data } = ret;
    const { pageData = [], totalCount = 0 } = data || {};
    if (code === 0) {
      if (params.page === 1) this.setTopic(pageData || [], totalCount);
      else this.appendTopic(pageData || [], totalCount);
    }
    this.setLoadingStatus(LOADING_TOTAL_TYPE.topic, false);
    return ret;
  }

  // 设置 loading 状态
  @action.bound
  setLoadingStatus(type, status) {
    this.loading[type] = status;
  }

  // 设置表情
  @action.bound
  setEmoji(data) {
    this.emojis = data;
  }

  // 设置关注
  @action.bound
  setFollow(data, totalCount) {
    this.follows = data || [];
    this.followsTotalCount = totalCount;
  }

  // 附加关注
  @action.bound
  appendFollow(data, totalCount) {
    this.follows = [...this.follows, ...data];
    this.followsTotalCount = totalCount;
  }

  // 设置商品信息
  @action.bound
  setProduct(data) {
    this.product = data;
  }

  // 设置话题列表
  @action.bound
  setTopic(data, totalCount) {
    this.topics = data;
    this.topicTotalCount = totalCount;
  }

  // 附加话题列表
  @action.bound
  appendTopic(data, totalCount) {
    this.topics = [...this.topics, ...data];
    this.topicTotalCount = totalCount;
  }

  // 同步发帖数据到store
  @action.bound
  setPostData(data) {
    this.postData = { ...this.postData, ...data };
  }

  // 设置当前选中分类
  @action.bound
  setCategorySelected(data) {
    this.categorySelected = data || { parent: {}, child: {} };
  }

  // 重置发帖数据
  @action.bound
  resetPostData() {
    this.postData = { ...initPostData };
    this.currentSelectedToolbar = false;
    this.setCategorySelected();
  }

  /**
   * 获取格式化之后的插件对象信息，包括语音等
   */
  @action
  gettContentIndexes() {
    const { images, video, files, product, audio, redpacket, rewardQa, orderInfo = {} } = this.postData;
    const imageIds = Object.values(images).map(item => item.id);
    const docIds = Object.values(files).map(item => item.id);
    const contentIndexes = {};
    // 和后端商量之后，还是如果没有数据的插件不传给后端
    if (imageIds.length > 0) {
      contentIndexes[THREAD_TYPE.image] = {
        tomId: THREAD_TYPE.image,
        body: { imageIds },
      };
    }
    if (video.id || video.threadVideoId) {
      contentIndexes[THREAD_TYPE.video] = {
        tomId: THREAD_TYPE.video,
        body: { videoId: video.id || video.threadVideoId || '' },
      };
    }
    if (docIds.length > 0) {
      contentIndexes[THREAD_TYPE.file] = {
        tomId: THREAD_TYPE.file,
        body: { docIds },
      };
    }
    if (product.id) {
      contentIndexes[THREAD_TYPE.goods] = {
        tomId: THREAD_TYPE.goods,
        body: { ...product },
      };
    }
    if (audio.id || audio.threadVideoId) {
      contentIndexes[THREAD_TYPE.voice] = {
        tomId: THREAD_TYPE.voice,
        body: { audioId: audio.id || audio.threadVideoId || '' },
      };
    }
    // const draft = this.isThreadPaid ? 0 : 1;
    // 红包和悬赏插件不需要传入草稿字段了，直接使用全局的即可
    if (redpacket.price) { //  && !orderInfo.status 不管是否支付都传入
      contentIndexes[THREAD_TYPE.redPacket] = {
        tomId: THREAD_TYPE.redPacket,
        body: { orderSn: orderInfo.orderSn, ...redpacket },
      };
    }

    if (rewardQa.value) { //  && !orderInfo.status
      contentIndexes[THREAD_TYPE.reward] = {
        tomId: THREAD_TYPE.reward,
        body: { expiredAt: rewardQa.times, price: rewardQa.value, type: 0, orderSn: orderInfo.orderSn },
      };
    }
    return contentIndexes;
  }

  /**
   * 获取发帖时需要的参数
   */
  @action
  getCreateThreadParams(isUpdate, isMini) {
    const { title, categoryId, contentText, position, price,
      attachmentPrice, freeWords, redpacket, rewardQa } = this.postData;
    let text = contentText;
    if (isMini) {
      // 目前只是简单的队小程序进行简单的处理
      text = `${text.replace(/(\n*)$/, '').replace(/\n/g, '<br />')}`;
    }
    text = emojiFormatForCommit(text)
      .replace(/@([^@<]+)<\/p>/g, '@$1 </p>')
      .replace(/<code>\s*([^\s]+)\s*<\/code>/g, '<code>$1</code>') // 行内代码块空格问题
      .replace(/<br \/>\n\s?/g, '<br />\n'); // 软换行来回切换到一行再软换行容易多出一个空格，先在业务侧进行处理
    const params = {
      title, categoryId, content: {
        text,
      },
    };
    if (position.address) params.position = position;
    else {
      // 主要是编辑时删除位置的情况，暂时区别开编辑和发帖，因为后台没有更新接口避免影响发帖
      if (isUpdate) params.position = {
        longitude: 0,
        latitude: 0,
        cityname: '',
        address: '',
        location: '',
      };
    }
    params.price = price || 0;
    params.freeWords = freeWords || 0;
    params.attachmentPrice = attachmentPrice || 0;
    params.draft = this.postData.draft;
    if (redpacket.price && !this.isThreadPaid) {
      params.draft = 1;
    }
    if (rewardQa.value && !this.isThreadPaid) {
      params.draft = 1;
    }
    params.anonymous = this.postData.anonymous;
    const contentIndexes = this.gettContentIndexes();
    if (Object.keys(contentIndexes).length > 0) params.content.indexes = contentIndexes;
    return params;
  }

  @action
  formatThreadDetailToPostData(detail, isMini) {
    const { title, categoryId, content, freewords = 0, isDraft, isAnonymous, orderInfo = {}, threadId } = detail || {};
    const price = Number(detail.price);
    const attachmentPrice = Number(detail.attachmentPrice);
    let position = {};
    if (detail.position && detail.position.address) position = detail.position;
    let contentText = content && content.text;
    // 目前只是简单的队小程序进行简单的处理
    if (isMini) contentText = contentText.replace(/<br \/>\n/g, '\n').replace(/<br \/>/g, '\n');
    // 解决web端行内换行编辑问题
    else {
      contentText = s9e.emotion(contentText); // 小程序发帖不用转换表情，web端需要
      contentText = contentText.replace(/<br \/>\n/g, '<br />');
    }
    const contentindexes = (content && content.indexes) || {};
    let audio = {};
    let rewardQa = {};
    let product = {};
    let redpacket = {};
    let video = {};
    const images = {};
    const files = {};
    // 插件格式化
    Object.keys(contentindexes).forEach((index) => {
      const tomId = Number(contentindexes[index].tomId);
      if (tomId === THREAD_TYPE.image) {
        const imageBody = contentindexes[index].body || [];
        imageBody.forEach((item) => {
          images[item.id] = { ...item, type: item.fileType, name: item.fileName };
        });
      }
      if (tomId === THREAD_TYPE.file) {
        const fileBody = contentindexes[index].body || [];
        fileBody.forEach((item) => {
          files[item.id] = { ...item, type: item.fileType, name: item.fileName };
        });
      }
      if (tomId === THREAD_TYPE.voice) {
        audio = contentindexes[index].body || {};
        const audioId = audio.id || audio.threadVideoId;
        audio.id = audioId;
      }
      if (tomId === THREAD_TYPE.goods) product = contentindexes[index].body;
      if (tomId === THREAD_TYPE.video) {
        video = contentindexes[index].body || {};
        video.thumbUrl = video.mediaUrl;
        const videoId = video.id || video.threadVideoId;
        video.id = videoId;
      }
      if (tomId === THREAD_TYPE.redPacket) {
        const price = contentindexes[index]?.body?.money;
        redpacket = { ...(contentindexes[index]?.body || {}), price };
      }
      // expiredAt: rewardQa.times, price: rewardQa.value, type: 0
      if (tomId === THREAD_TYPE.reward) {
        const times = contentindexes[index].body.expiredAt
          ? formatDate(contentindexes[index].body.expiredAt?.replace(/-/g, '/'), 'yyyy/MM/dd hh:mm')
          : formatDate(new Date().getTime() + (25 * 3600 * 1000), 'yyyy/MM/dd hh:mm');
        const value = contentindexes[index].body.money || '';
        rewardQa = {
          ...(contentindexes[index].body || {}),
          times,
          value,
        };
      }
    });
    const anonymous = isAnonymous ? 1 : 0;
    this.setPostData({
      // 标题去掉富文本
      title: title.replace(/<[^<>]+>/g, ''),
      categoryId,
      price,
      attachmentPrice,
      position,
      contentText: contentText ? emojiFromEditFormat(contentText) : '',
      audio,
      rewardQa,
      product,
      redpacket,
      video,
      images,
      files,
      freeWords: freewords,
      isDraft,
      anonymous,
      orderInfo,
      threadId,
    });
  }

  @action
  setCurrentSelectedToolbar(type) {
    this.currentSelectedToolbar = type;
  }

  @action.bound
  setCursorPosition(val) {
    this.cursorPosition = val;
  }

  @action
  setNavInfo(info) {
    if (info) this.navInfo = info;
  }

  /**
   * 根据 ID 获取当前选中的类别
   * @param {number} id 帖子类别id
   * @returns 选中的帖子详细信息
   */
  @action
  getCategorySelectById(id) {
    let parent = {};
    let child = {};
    let currentId = id;
    const categories = this.getCurrentCategories();
    // 如果没有传入id，则取默认第一个
    if (!id && categories && categories.length) currentId = categories[0].pid;
    if (categories && categories.length && currentId) {
      categories.forEach((item) => {
        const { children } = item;
        if (item.pid === currentId) {
          parent = item;
          if (children && children.length > 0) [child] = children;
        } else {
          if (children && children.length > 0) {
            children.forEach((elem) => {
              if (elem.pid === currentId) {
                child = elem;
                parent = item;
              }
            });
          }
        }
      });
    }
    // 如果有 id，但是没有设置选中的种类，说明可能是编辑没有发帖权限的分类帖子，这时也展示第一个帖子
    if (id && !parent.pid && categories && categories.length) {
      currentId = categories[0].pid;
      return this.getCategorySelectById(currentId);
    }
    return { parent, child };
  }

  @action
  getCategoriesCanCreate() {
    const len = this.categories.length;
    if (!len) return;
    const result = [];
    for (let i = 0; i < len; i++) {
      const { canCreateThread, children } = this.categories[i];
      let item = {};
      if (canCreateThread) {
        item = this.categories[i];
        if (children && children.length) {
          item.children = [...children.filter(elem => elem.canCreateThread)];
        }
        result.push(item);
      }
    }
    return result;
  }

  @action
  getCategoriesCanEdit() {
    const len = this.categories.length;
    if (!len) return;
    const result = [];
    for (let i = 0; i < len; i++) {
      const { canEditThread, children } = this.categories[i];
      let item = {};
      if (canEditThread) {
        item = this.categories[i];
        if (children && children.length) {
          item.children = [...children.filter(elem => elem.canEditThread)];
        }
        result.push(item);
      }
    }
    return result;
  }

  @action
  getCurrentCategories() {
    if (this.threadStatus === THREAD_STATUS.edit) return this.getCategoriesCanEdit();
    return this.getCategoriesCanCreate();
  }

  @action
  setThreadStatus(status) {
    this.threadStatus = status || THREAD_STATUS.create;
  }

  @action
  setLocalDataStatus(status) {
    this.isHaveLocalData = status;
  }
}

export default ThreadPostAction;
