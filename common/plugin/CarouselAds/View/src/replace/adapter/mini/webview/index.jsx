import React, { Fragment } from 'react'
import { WebView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'

const WebViewPages = () => {
  const paramsUrl = useRouter().params.url
  let url = paramsUrl || Taro.getStorageSync('webWiewUrl') || ''
  return <Fragment>{url && <WebView src={url} />}</Fragment>
}
export default React.memo(WebViewPages)
