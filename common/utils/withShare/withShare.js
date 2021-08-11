import Taro from '@tarojs/taro';

/**
 * @param {boolean} needShareline 是否需要分享到朋友圈
 * @param {boolean} needLogin 是否需要登录
 * @returns
 */
function withShare() {
  // 设置默认
  const defalutTitle = 'Discuz!Q';
  let defalutPath = 'pages/index/index';
  defalutPath = `/pages/index/index?path=${encodeURIComponent(defalutPath)}`;
  let menus = [];
  menus = ['shareAppMessage'];
  return function demoComponent(Component) {
    class WithShare extends Component {
      componentDidMount() {
        Taro.showShareMenu({
          withShareTicket: true,
          menus,
        });
        if (super.componentDidMount) {
          super.componentDidMount();
        }
      }
      onShareAppMessage = (res) => {
        const data = res.target?.dataset?.shareData || '';
        let shareData = '';
        if (this.getShareData && typeof this.getShareData === 'function') {
          shareData = this.getShareData({ ...data, from: res.from });
        }
        const { title = defalutTitle, path = defalutPath, imageUrl = '', promise } = shareData;
        const encodePath = `/pages/index/index?path=${encodeURIComponent(path)}`;
        const value = {
          title,
          path: encodePath,
          imageUrl,
        };
        return promise || new Promise((resolve) => {
          setTimeout(() => {
            resolve(value);
          }, 1000);
        });
      }

      render() {
        return super.render();
      }
    }

    return WithShare;
  };
}

export default withShare;

