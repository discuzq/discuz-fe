import isServer from '@common/utils/is-server';
import Taro from '@tarojs/taro';

let isSupportWebp = false;
if (!isServer()) {
    try {
        if (process.env.DISCUZ_ENV === 'web') {
            const img = document.createElement('canvas').toDataURL('image/webp', 0.5);
            isSupportWebp = img.indexOf('data:image/webp') === 0;
        } else {
            // TODO 需要区分小程序打包判断当前平台是安卓和ios
            if (Taro.getSystemInfoSync().platform === 'android') {
                isSupportWebp = true;
            } else {
                isSupportWebp = false;
            }
        }
    } catch(err) {
        isSupportWebp = false;
    }
}

const QUALITY_1 = '10';
const QUALITY_2 = '15';
const QUALITY_3 = '20';
const QUALITY_4 = '25';
const QUALITY_5 = '30';
const QUALITY_6 = '35';
const QUALITY_7 = '40';
const QUALITY_8 = '45';
const QUALITY_9 = '50';
const QUALITY_10 = '55';
const QUALITY_11 = '60';
const QUALITY_12 = '65';
const QUALITY_13 = '70';
const QUALITY_14 = '75';
const QUALITY_15 = '80';
const QUALITY_16 = '85';
const QUALITY_17 = '90';
const QUALITY_18 = '95';
const QUALITY_19 = '100';

const LEVEL_1 = 1;
const LEVEL_2 = 2;
const LEVEL_3 = 3;
const LEVEL_4 = 4;
const LEVEL_5 = 5;
const LEVEL_6 = 6;
const LEVEL_7 = 7;
const IMAGEMOGR2 = 'imageMogr2';
const QUALITY_NAME = '/quality/';
const INTERLACE = '/interlace/1';
const CONVERSION = '/format';
const CGIF = '/cgif';

function _conversion(conversion) {
    return `${CONVERSION}/${conversion}`;
}

function _level_1_quality(viewWidth, conversion) {
    let zoom = QUALITY_7;
    if ( viewWidth > 667 && viewWidth < 1080 ){
        zoom = QUALITY_10;
    } else if ( viewWidth >= 1080  ){
        zoom = QUALITY_12;
    }
    return `${IMAGEMOGR2}${conversion ? _conversion(conversion) : ''}${QUALITY_NAME}${zoom}${INTERLACE}`;
}

function _level_2_quality(viewWidth, conversion) {
    let zoom = QUALITY_6;
    if ( viewWidth > 667 && viewWidth < 1080 ){
        zoom = QUALITY_8;
    } else if ( viewWidth >= 1080  ){
        zoom = QUALITY_10;
    }
    return `${IMAGEMOGR2}${conversion ? _conversion(conversion) : ''}${QUALITY_NAME}${zoom}${INTERLACE}`;
}

function _level_3_quality(viewWidth, conversion) {
    let zoom = QUALITY_5;
    if ( viewWidth > 667 && viewWidth < 1080 ){
        zoom = QUALITY_6;
    } else if ( viewWidth >= 1080  ){
        zoom = QUALITY_7;
    }
    return `${IMAGEMOGR2}${conversion ? _conversion(conversion) : ''}${QUALITY_NAME}${zoom}${INTERLACE}`;
}

function _level_4_quality(viewWidth, conversion) {
    let zoom = QUALITY_4;
    if ( viewWidth > 667 && viewWidth < 1080 ){
        zoom = QUALITY_5;
    } else if ( viewWidth >= 1080  ){
        zoom = QUALITY_6;
    }
    return `${IMAGEMOGR2}${conversion ? _conversion(conversion) : ''}${QUALITY_NAME}${zoom}${INTERLACE}`;
}

function _level_5_quality(viewWidth, conversion) {
    let zoom = QUALITY_3;
    if ( viewWidth > 667 && viewWidth < 1080 ){
        zoom = QUALITY_4;
    } else if ( viewWidth >= 1080  ){
        zoom = QUALITY_5;
    }
    return `${IMAGEMOGR2}${conversion ? _conversion(conversion) : ''}${QUALITY_NAME}${zoom}${INTERLACE}`;
}

function _level_6_quality(viewWidth, conversion) {
    let zoom = QUALITY_2;
    if ( viewWidth > 667 && viewWidth < 1080 ){
        zoom = QUALITY_3;
    } else if ( viewWidth >= 1080  ){
        zoom = QUALITY_4;
    }
    return `${IMAGEMOGR2}${conversion ? _conversion(conversion) : ''}${QUALITY_NAME}${zoom}${INTERLACE}`;
}

function _level_7_quality(viewWidth, conversion) {
    let zoom = QUALITY_1;
    if ( viewWidth > 667 && viewWidth < 1080 ){
        zoom = QUALITY_2;
    } else if ( viewWidth >= 1080  ){
        zoom = QUALITY_3;
    }
    return `${IMAGEMOGR2}${conversion ? _conversion(conversion) : ''}${QUALITY_NAME}${zoom}${INTERLACE}`;
}

export default function calcImageQuality(viewWidth, type, level) {
    let param;
    // 根据图片类型判断使用何种方式
    if (/(jpg|jpeg|webp)/.test(type)) {
        switch (level) {
            case LEVEL_1: param = _level_1_quality(viewWidth, isSupportWebp ? 'webp' : null);
            break;
            case LEVEL_2: param = _level_2_quality(viewWidth, isSupportWebp ? 'webp' : null);
            break;
            case LEVEL_3: param = _level_3_quality(viewWidth, isSupportWebp ? 'webp' : null);
            break;
            case LEVEL_4: param = _level_4_quality(viewWidth, isSupportWebp ? 'webp' : null);
            break;
            case LEVEL_5: param = _level_5_quality(viewWidth, isSupportWebp ? 'webp' : null);
            break;
            case LEVEL_6: param = _level_6_quality(viewWidth, isSupportWebp ? 'webp' : null);
            break;
            case LEVEL_7: param = _level_7_quality(viewWidth, isSupportWebp ? 'webp' : null);
            break;
            default: param = _level_1_quality(viewWidth, isSupportWebp ? 'webp' : null);
        }
    } else if(/(gif)/.test(type)) {
        let frame = 5;
        if ( viewWidth > 667 && viewWidth < 1080 ){
            frame = 5;
        } else if ( viewWidth >= 1080  ){
            frame = 10;
        }
        return `${IMAGEMOGR2}${CGIF}/${frame}`;
    } else {
        switch (level) {
            case LEVEL_1: param = _level_1_quality(viewWidth, isSupportWebp ? 'webp' : 'jpg');
            break;
            case LEVEL_2: param = _level_2_quality(viewWidth, isSupportWebp ? 'webp' : 'jpg');
            break;
            case LEVEL_3: param = _level_3_quality(viewWidth, isSupportWebp ? 'webp' : 'jpg');
            break;
            case LEVEL_4: param = _level_4_quality(viewWidth, isSupportWebp ? 'webp' : 'jpg');
            break;
            case LEVEL_5: param = _level_5_quality(viewWidth, isSupportWebp ? 'webp' : 'jpg');
            break;
            case LEVEL_6: param = _level_6_quality(viewWidth, isSupportWebp ? 'webp' : 'jpg');
            break;
            case LEVEL_7: param = _level_7_quality(viewWidth, isSupportWebp ? 'webp' : 'jpg');
            break;
            default: param = _level_1_quality(viewWidth, isSupportWebp ? 'webp' : 'jpg');
        }
    }
    return param;
}