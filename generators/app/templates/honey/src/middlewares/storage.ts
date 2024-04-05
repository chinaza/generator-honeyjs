import multer from 'multer';
import multerS3 from 'multer-s3';
import { getEnv } from '../config';
import s3 from '../services/storage';
import path from 'path';

export const createUploadMiddleware = (
  directory: string,
  allowedExts?: string[]
) => {
  return multer({
    fileFilter(_, file, callback) {
      const ext = path.extname(file.originalname);
      allowedExts = allowedExts || [
        '.pdf',
        '.jpg',
        '.png',
        '.bmp',
        '.svg',
        '.jpeg'
      ];
      if (allowedExts.includes(ext)) {
        callback(null, true);
      } else {
        callback(null, false); // handle error in middleware, not here
      }
    },
    limits: {
      fileSize: 1024 * 1024 * 25
    },
    storage: multerS3({
      s3,
      bucket: getEnv('AWS_S3_BUCKET'),
      key: (req: any, file, cb) => {
        const fileName = `${directory}/${Date.now()}-${file.originalname
          .replace('/', '-')
          .substring(0, 100)}`; // Truncate files with long names
        cb(null, fileName);
      }
    })
  });
};
