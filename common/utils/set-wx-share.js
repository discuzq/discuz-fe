import browser from '@common/utils/browser';

export default function setWxShare(title, desc, link, img) {
    if (!browser.env('weixin')) return;
    window.wx && window.wx.ready(() => {
        const dataInfo = {
            title: title || 'Discuz! Q', // 分享标题
            desc: desc && desc != '' ? desc : (title || 'Discuz! Q'), // 分享描述
            link: link || window.location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            imgUrl: img, // 分享图标
        };
        wx.updateAppMessageShareData(dataInfo); // 分享给朋友
        wx.updateTimelineShareData(dataInfo); // 分享到朋友圈
    });
}