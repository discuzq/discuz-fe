import { action } from 'mobx';
import ThreadPostStore from './store';
import { readEmoji, readFollow, readProcutAnalysis, readTopics, createThread, updateThread, createThreadVideoAudio } from '@common/server';
import { LOADING_TOTAL_TYPE, THREAD_TYPE } from '@common/constants/thread-post';
import { emojiFromEditFormat, emojiFormatForCommit } from '@common/utils/emoji-regexp';
import { formatDate } from '@common/utils/format-date';

class ThreadPostAction extends ThreadPostStore {
  /**
   * 发帖
   */
  @action.bound
  async createThread() {
    const params = this.getCreateThreadParams();
    const ret = await createThread(params);
    if (ret.code === 0) this.currentSelectedToolbar = false;
    return ret;
  }

  /**
   * 更新帖子
   * @param {number} id 帖子id
   */
  @action.bound
  async updateThread(id) {
    const params = this.getCreateThreadParams();
    const ret = await updateThread({ ...params, threadId: Number(id) });
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
    this.postData = {
      title: '',
      categoryId: 0,
      anonymous: 0,
      draft: 0,
      price: 0,
      attachmentPrice: 0,
      freeWords: 1,
      position: {},
      contentText: '',
      audio: {},
      rewardQa: {},
      product: {},
      redpacket: {},
      video: {},
      images: {},
      files: {},
    };
    this.setCategorySelected();
  }

  /**
   * 获取格式化之后的插件对象信息，包括语音等
   */
  @action
  gettContentIndexes() {
    const { images, video, files, product, audio, redpacket, rewardQa, orderSn, draft } = this.postData;
    const imageIds = Object.values(images).map(item => item.id);
    const docIds = Object.values(files).map(item => item.id);
    const contentIndexes = {};
    if (imageIds.length > 0) {
      contentIndexes[THREAD_TYPE.image] = {
        tomId: THREAD_TYPE.image,
        body: { imageIds },
      };
    }
    if (video.id) {
      contentIndexes[THREAD_TYPE.video] = {
        tomId: THREAD_TYPE.video,
        body: { videoId: video.id },
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
    if (audio.id) {
      contentIndexes[THREAD_TYPE.voice] = {
        tomId: THREAD_TYPE.voice,
        body: { audioId: audio.id },
      };
    }

    const draftData = draft ? 1 : 0;
    if (redpacket.price && !redpacket.id) {
      contentIndexes[THREAD_TYPE.redPacket] = {
        tomId: THREAD_TYPE.redPacket,
        body: { orderSn, ...redpacket, draft: draftData },
      };
    }

    if (rewardQa.value && !rewardQa.id) {
      contentIndexes[THREAD_TYPE.reward] = {
        tomId: THREAD_TYPE.reward,
        body: { expiredAt: rewardQa.times, price: rewardQa.value, type: 0, orderSn, draft: draftData },
      };
    }
    return contentIndexes;
  }

  /**
   * 获取发帖时需要的参数
   */
  @action
  getCreateThreadParams() {
    const { title, categoryId, contentText, position, price, attachmentPrice, freeWords } = this.postData;
    const params = {
      title, categoryId, content: {
        text: emojiFormatForCommit(contentText),
      },
    };
    if (position.address) params.position = position;
    if (!!price) {
      params.price = price;
      params.freeWords = freeWords;
    }
    if (!!attachmentPrice) params.attachmentPrice = attachmentPrice;
    if (this.postData.draft) params.draft = this.postData.draft;
    if (this.postData.anonymous) params.anonymous = this.postData.anonymous;
    const contentIndexes = this.gettContentIndexes();
    if (Object.keys(contentIndexes).length > 0) params.content.indexes = contentIndexes;
    return params;
  }

  @action
  formatThreadDetailToPostData(detail) {
    const { title, categoryId, content, freeWords = 1 } = detail || {};
    const price = Number(detail.price);
    const attachmentPrice = Number(detail.attachmentPrice);
    let position = {};
    if (detail.position && detail.position.address) position = detail.position;
    const contentText = content && content.text;
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
      if (tomId === THREAD_TYPE.voice) audio = contentindexes[index].body;
      if (tomId === THREAD_TYPE.goods) product = contentindexes[index].body;
      if (tomId === THREAD_TYPE.video) {
        video = contentindexes[index].body;
        video.thumbUrl = video.mediaUrl;
      }
      if (tomId === THREAD_TYPE.redPacket) {
        const price = contentindexes[index]?.body?.money;
        redpacket = { ...(contentindexes[index]?.body || {}), price };
      }
      // expiredAt: rewardQa.times, price: rewardQa.value, type: 0
      if (tomId === THREAD_TYPE.reward) rewardQa = {
        ...contentindexes[index].body,
        times: formatDate(contentindexes[index].body.expiredAt?.replace(/-/g, '/'), 'yyyy/MM/dd hh:mm'),
        value: contentindexes[index].body.money || '',
      };
    });

    this.setPostData({
      // 标题去掉富文本
      title: title.replace(/<[^<>]+>/g, ''),
      categoryId,
      price,
      attachmentPrice,
      position,
      contentText: emojiFromEditFormat(contentText),
      audio,
      rewardQa,
      product,
      redpacket,
      video,
      images,
      files,
      freeWords,
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
}

export default ThreadPostAction;
