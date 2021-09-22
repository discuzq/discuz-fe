export default function getRouterCategory(router, site) {
    const defaultData = {
        categoryids: ['all'], // 这里的逻辑如果更改，记得需要更改下面的计算属性：isCurrentAllCategory
        sequence: 0,
        sort: 1,
        attention: 0,
        types: 'all',
        essence: 0,
      }
    try {
        let { categoryId = '', sequence = '0' } = router.query || {};
        // 路由中带值
        if (categoryId || sequence !== '0') {
            let ids = categoryId.split('_').map(item => {
              // 判断categoryId是否是数字。可能是all/default
              const id = /^\d+$/.test(item) ? Number(item) : item
      
              return id
            }).filter(item => item)
      
            // H5处理方案
            if (sequence === '1' && !ids?.length && site.platform === 'h5') {
              ids = ['default']
            }
      
            if (ids.indexOf('default') !== -1 && sequence === '0' && site.platform === 'h5') {
              sequence = '1'
            }
      
            // PC处理方案
            if (!ids?.length && site.platform === 'pc') {
              ids = ['all']
            }
      
            return { ...defaultData, categoryids: ids, sequence };
        } else {
            // 路由中不带值，从store中获取
            return defaultData
        }
    } catch(err) {
        return defaultData
    }
    
}