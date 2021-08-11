import { createAttachment } from '@common/server';
import { fixImageOrientation } from '@common/utils/exif';


// type: 1是图片，2是文件


// 单个文件上传
const attachmentUploadOne = async (file, type = 1) => {
  const formData = new FormData();
  formData.append('type', type);

  if (typeof file === 'string') {
    formData.append('fileUrl', file);
  } else {
    const fileImg = await fixImageOrientation(file);
    formData.append('file', fileImg);
  }

  return new Promise(async resolve => {
    const res = await createAttachment(formData);
    resolve(res);
  })
};

// 多个文件上传
const attachmentUploadMultiple = async (files, type = 1) => {
  const uploadPromises = [];
  for (let i = 0; i < files.length; i++) {
    uploadPromises.push(attachmentUploadOne(files[i], type));
  }
  return Promise.all(uploadPromises);
};

export { attachmentUploadOne, attachmentUploadMultiple };
