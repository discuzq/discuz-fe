import { createPosts } from '@discuzq/sdk/dist/api/thread/create-posts';

export default async function _createPosts(opts, ctx = null) {
  return await createPosts({ ...opts, __context: ctx });
}
