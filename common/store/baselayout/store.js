import { observable } from 'mobx';
class IndexStore {
  constructor() {}

  @observable home = -1;

  @observable search = -1;

  @observable draft = -1;

  @observable isJumpingToTop = false;

  @observable playingVideoPos = -1;

  @observable playingVideoDom = ''; // Video的selector string

  @observable playingAudioPos = -1;

  @observable playingAudioDom = null; // 来自组件Audio的context

  @observable playingAudioWrapperId = ''; // 小程序用于定位，web用于记录当前播放的音频

  @observable videoFullScreenStatus = ''; // 视频全屏播放的状态
}

export default IndexStore;
