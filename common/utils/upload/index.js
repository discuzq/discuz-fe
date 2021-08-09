import cosSdkUpload from './cos-sdk-upload';
import attachmentApiUpload from './attachment-api-upload';

const upload = (options) => {
  const {
    files,
    type,
    qcloudCos,
    qcloudCosBucketName,
    qcloudCosBucketArea,
    qcloudCosSignUrl,
    supportImgExt,
    supportMaxSize,
  } = options;

  debugger;
  return Promise.all(files.map(file => {
    options.file = file;

    return new Promise(async resolve => {
      try {
        const res = await cosSdkUpload(options);
        resolve(res);
      } catch (error) {
        const res = await attachmentApiUpload(options);
        resolve(res);
      }
    });

  }));
};

export default upload;
