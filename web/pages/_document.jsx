import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import envConfig from '@common/config';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  createMonitor() {
    if (process.env.NODE_ENV === 'production' ) {
      return (
        <React.Fragment>
          <script src="https://cdn-go.cn/aegis/aegis-sdk/latest/aegis.min.js?_bid=3977"></script>
        </React.Fragment>
      );
    }
    return null;
  }

  createTalkingdata() {
    const currEnvConfig = envConfig();

    if ( process.env.NODE_ENV === 'development' ) {
      return '';
    }
    return `
      var appid = '';
      var channelname = window.location.hostname;
      if (!!window.navigator.userAgent.match(/AppleWebKit.*Mobile.*/)) {
        appid = '500D36509CE649E88446FB4E7A51B221'; // h5
      } else {
        appid = '4F323A1D5F444BF69C7C4E10704AEA2F'; // pc
      }
      var url = 'http://sdk.talkingdata.com/app/h5/v1?appid=' + appid + '&vn=' + '${currEnvConfig.version}' + '&vc=' + '${currEnvConfig.version}' + '&td_channelid=' + channelname;
      if ( window.location.protocol.indexOf('https') != -1 ) {
        url = 'https://jic.talkingdata.com/app/h5/v1?appid=' + appid + '&vn=' + '${currEnvConfig.version}' + '&vc=' + '${currEnvConfig.version}' + '&td_channelid=' + channelname;
      }
      var talkingdata = document.createElement('script');
      talkingdata.type = 'text/javascript';
      talkingdata.async = true;
      talkingdata.src = url;
      document.getElementsByTagName('body')[0].appendChild(talkingdata);
    `
  }

  render() {
  
    return (
      <Html lang="cn">
        <Head>
          <meta name="screen-orientation" content="portrait"/>
          <meta name="x5-orientation" content="portrait"/>
          <script dangerouslySetInnerHTML={{ __html: `
              setTimeout(function() {
                function remCalc (){
                  var a = 375;
                  if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                    a=document.documentElement.clientWidth||document.body.clientWidth;
                    if(a>750){a=750}else{if(a<320){a=320}}
                  }
                  document.documentElement.style.fontSize=(a/7.5)*2+"px";
                };
                remCalc();
                window.addEventListener('resize', remCalc);
              }, 0);
          ` }} />
        </Head>


        <body>
            <Main />
            <script dangerouslySetInnerHTML={{__html: `
                var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
                var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; //判断是否IE<11浏览器
                var isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf("rv:11.0") > -1;
                if(isIE || isIE11) {
                  document.body.innerHTML = '<style>html,body{width: 100%;height: 100%;display: block;}h1{padding: 20px;}h3{padding: 15px;}.box{text-align: center;margin-top: 40vh;}</style><div class="box"><h1>站点不支持IE浏览器！</h1><h3>请使用QQ浏览器、chorme，Edge等浏览器。</h3></div>';
                }
            `}}>

            </script>
            <NextScript/>
        </body>
        <script dangerouslySetInnerHTML={{__html: this.createTalkingdata()}}/>
        <script dangerouslySetInnerHTML={{__html: `
          window.sessionStorage.setItem('__TD_td_channel', window.location.hostname.replace(/\./g, '_'));
          var tdjs = document.createElement('script');
          tdjs.type = 'text/javascript';
          tdjs.async = true;
          tdjs.src = 'https://jic.talkingdata.com/app/h5/v1?appid=750AEE91CF4446A19A2D12D5EE32F725';
          document.getElementsByTagName('body')[0].appendChild(tdjs);

          var dzqjs = document.createElement('script');
          dzqjs.type = 'text/javascript';
          dzqjs.async = true;
          dzqjs.src = 'https://dl.discuz.chat/dzq.js';
          document.getElementsByTagName('body')[0].appendChild(dzqjs);
        `}}/>
        <script dangerouslySetInnerHTML={{__html: `
            // 微信设置字体最大，布局乱的补丁
            function is_weixn() {
              var ua = navigator.userAgent.toLowerCase();
              return ua.match(/MicroMessenger/i) == "micromessenger";
            }
            if (is_weixn()) {
              if (
                typeof WeixinJSBridge == "object" &&
                typeof WeixinJSBridge.invoke == "function"
              ) {
                handleFontSize();
              } else {
                if (document.addEventListener) {
                  document.addEventListener("WeixinJSBridgeReady", handleFontSize, false);
                } else if (document.attachEvent) {
                  document.attachEvent("WeixinJSBridgeReady", handleFontSize);
                  document.attachEvent("onWeixinJSBridgeReady", handleFontSize);
                }
              }
              function handleFontSize() {
                // 设置网页字体为默认大小
                WeixinJSBridge.invoke("setFontSizeCallback", { fontSize: 0 });
                // 重写设置网页字体大小的事件
                WeixinJSBridge.on("menu:setfont", function () {
                  WeixinJSBridge.invoke("setFontSizeCallback", { fontSize: 0 });
                });
              }
            }
        `}}/>
        {/* <!--腾讯地图定位组件--> */}
        <script async={true} src="https://mapapi.qq.com/web/mapComponents/geoLocation/v/geolocation.min.js"></script>
        {/* 编辑器markdown依赖 */}
        <script async={true} src="https://cdn.jsdelivr.net/npm/@discuzq/vditor@1.0.22/dist/js/lute/lute.min.js" ></script>
        <script src="/js/cos-document-preview-sdk-v0.1.1.js"></script>
        {this.createMonitor()}
      </Html>
    );
  }
}

export default MyDocument;
