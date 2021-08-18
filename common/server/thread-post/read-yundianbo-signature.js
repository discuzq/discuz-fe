// import {deleteDeny} from '@discuzq/sdk/dist/api/user/delete-deny';
import { readYundianboSign } from '@discuzq/sdk/dist/api/other/read-yundianbo-signature';
/**
 * 云点播前端上传签名
 */
export default async function _readYundianboSignature(params = {}) {
  const res = await readYundianboSign({
    data: params,
  });
  return res;
}
