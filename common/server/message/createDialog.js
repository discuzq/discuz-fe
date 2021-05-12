import api from '../api';

/**
 * 创建新的私信对话
 * TODO: 待更新到sdk
 */
export default async function createDialog(params) {
  const res = await api.http({
    url: '/apiv3/dialog.create',
    method: 'post',
    data: params,
    timeout: 5000,
  });
  return res;
}
