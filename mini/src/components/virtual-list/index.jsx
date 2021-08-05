import React, { useEffect, useRef, useState , useMemo } from 'react';
import { arrTrans, getWindowHeight } from './utils';
import List from './List';
import { inject, observer } from 'mobx-react';


/**
 * 列表组件，集成上拉刷新能力
 * @prop {function} height 容器高度
 * @prop {function} className 容器样式
 * @param {string} noMore 无更多数据
 * @prop {function} onRefresh 触底触发事件，需返回promise
 * @prop {function} showRefresh 是否启用上拉刷新
 */
const VirtualList = ({
  data,
  isClickTab,
  wholePageIndex,
  index: indexStore,
  setVisible,
  setData
}) => {
  const [dataSource, setDataSource] = useState([]);
  const windowHeight = useRef(null)
  const listRef = useRef(null)

  // 处理分组数据
  useEffect(() => {
      if (!data?.length) {
        resetAllData()
      } else {
        const arr = arrTrans(10, data)
        const { changeInfo } = indexStore

        if (changeInfo) {
          const { type = '' } = changeInfo
          if (type === 'delete' || type === 'add' || type === 'edit' || type === 'pay') {
            setDataSource(arr) 
          }

          indexStore.changeInfo = null
        } else {
          const {length} = arr
          if (length && data.length > arrLength) {
            if (arrLength === 0) {
              setDataSource(arr)
            } else {
              const newArr = dataSource.slice()
              newArr.push(arr[length - 1]) 
              setDataSource(newArr)
            }
          }
        }
      } 
  }, [data?.length, indexStore.changeInfo])


  const getThreadInfo = (threadId) => {
    let pIndex = -1
    let sIndex = -1
    const newArr = [ ...dataSource ];
    newArr.forEach((subArr, index) => {
      for(let i = 0; i < subArr.length; i++) {
        if(subArr[i].threadId === threadId) {
          pIndex = index
          sIndex = i
        }
      }
    });

    return { pIndex, sIndex }
  }

  const arrLength = useMemo(() => {
    let length = 0
    dataSource.forEach(item => {
      length += item.length
    })
    return length
  }, [dataSource])

//   通知子组件去监听
  useEffect(() => {
    if (dataSource?.length && listRef?.current) {
        const length = dataSource.length - 1
        const { displays } = listRef.current.state
        if (dataSource?.length > displays?.length) {
            setTimeout(() => {
                listRef?.current?.observePage(length)
            }, 10);
        }
    }
  }, [dataSource, listRef?.current])

  // 获取屏幕高度
  useEffect(() => {
    getWindowHeight().then((res) => {
      windowHeight.current = res
    })
  }, [])

    //   当源数据为空时，重置组件数据
    const resetAllData = () => {
        setDataSource([])
    }

  const dispatch = (threadId, updatedThreadData) => {
    // if(!threadId || !updatedThreadData) return;

    // let newArr = [ ...dataSource ];
    // newArr.forEach((subArr) => {
    //   for(let i = 0; i < subArr.length; i++) {
    //     if(subArr[i].threadId === threadId) {
    //       subArr[i] = updatedThreadData;
    //       break;
    //     }
    //   }
    // });
    // setDataSource(newArr);
  }

  return (
      <>
        {
            (!isClickTab && dataSource?.length > 0) && <List 
                ref={(e) => { listRef.current = e }}
                dataSource={dataSource} 
                wholePageIndex={wholePageIndex} 
                windowHeight={windowHeight.current} 
                dispatch={dispatch}
                isClickTab={isClickTab}
                setVisible={setVisible}
                setData={setData}
            />
        }
      </>
    
  );
}

export default inject('index')(observer(VirtualList));
