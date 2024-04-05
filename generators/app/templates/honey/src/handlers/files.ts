import {
  ExitMiddleware,
  Honey,
  HttpError,
  Middleware,
  handleHttpError
} from '@chinaza/honey';
import { createUploadMiddleware } from '../middlewares/storage';
import { isZhap, validateUserAuth } from '../middlewares/auth';
import { getUserFromHeader, logError } from '../utils/helpers';
import { StorageProviders } from '../utils/constants';
import { deleteObject } from '../services/storage';
import createFileModel, { FileStatus, FileType } from '../models/file';
import redis from '../services/redis';

export default class FilesHandler {
  private fileModel = createFileModel();

  constructor(honey: Honey) {
    honey.get({
      resource: 'files',
      fields: ['id', 'name', 'status'],
      pathOverride: '/files/context',
      middleware: [validateUserAuth, this.assignProfileId],
      filter: {
        profileId: {
          operator: '=',
          value: 'string'
        }
      },
      format: {
        sort: 'DESC',
        sortField: 'createdAt'
      }
    });

    honey.getById({
      resource: 'files',
      pathOverride: '/files/context/:id/status',
      fields: ['id', 'status'],
      middleware: [validateUserAuth, this.fileUploadStatFromCache]
    });

    honey.deleteById({
      resource: 'files',
      message: 'File deleted successfully',
      middleware: [validateUserAuth, this.assignProfileId, this.deleteFile],
      pathOverride: '/files/context/:id',
    });

    honey.create({
      resource: 'files',
      message: 'File uploaded successfully',
      params: {
        profileId: 'string',
        provider: 'string',
        path: 'string',
        name: 'string'
      },
      pathOverride: '/files/context',
      middleware: [
        validateUserAuth,
        this.assignProfileId,
        async (req, res, next) => {
          try {
            if (!req.body.profileId)
              throw new HttpError('You need to signup to use files', 401);

            next();
          } catch (error: any) {
            handleHttpError(error, res);
          }
        },
        this.uploadFile,
        async (req, res, next) => {
          try {
            if (!req.file) throw new HttpError('Invalid file type', 422);

            req.body.provider = StorageProviders.S3;
            const { key, originalname } = req.file as any;
            req.body.path = key;
            req.body.name = originalname;

            next();
          } catch (error: any) {
            handleHttpError(error, res);
          }
        },
        this.assignProfileId // Workaround 'cos `this.uploadFile` clears req.body.
      ],
    });

    honey.create({
      resource: 'files',
      message: 'Image uploaded successfully',
      pathOverride: '/files/image',
      params: {
        profileId: 'string',
        provider: 'string',
        path: 'string',
        name: 'string',
        status: 'string',
        type: 'string'
      },
      middleware: [
        validateUserAuth,
        this.assignProfileId,
        async (req, res, next) => {
          try {
            if (!req.body.profileId)
              throw new HttpError('You need to signup to use files', 401);

            req.body.type = FileType.IMAGE;
            next();
          } catch (error: any) {
            handleHttpError(error, res);
          }
        },
        this.uploadFile,
        async (req, res, next) => {
          try {
            if (!req.file) throw new HttpError('Invalid file type', 422);

            req.body.provider = StorageProviders.S3;
            const { key, originalname } = req.file as any;
            req.body.path = key;
            req.body.name = originalname;
            req.body.status = FileStatus.PROCESSED;
            req.body.type = FileType.IMAGE; // Workaround 'cos `this.uploadFile` clears req.body.

            next();
          } catch (error: any) {
            handleHttpError(error, res);
          }
        },
        this.assignProfileId // Workaround 'cos `this.uploadFile` clears req.body.
      ]
    });

    honey.updateById({
      message: 'File updated successfully',
      resource: 'files',
      params: {
        status: 'replace',
        updatedAt: '@updatedAt'
      },
      middleware: [isZhap]
    });
  }

  private assignProfileId: Middleware = (req, res, next) => {
    const user = getUserFromHeader(req.headers);

    if (user.loginType === 'guest') {
      return handleHttpError(
        new HttpError('Guest users cannot use files', 400),
        res
      );
    }

    req.body.profileId = user.profileId;
    req.query.profileId = user.profileId;

    next();
  };

  private uploadFile: Middleware = async (req, res, next) => {
    try {
      const { firebaseId, profileId } = getUserFromHeader(req.headers);
      const userFileCount = await this.fileModel.count({
        where: { profileId, type: FileType.PDF }
      });
      if (userFileCount >= 5 && req.body.type !== FileType.IMAGE)
        throw new HttpError(
          'You have exceeded your PDF file upload limit. Delete a PDF file to make space',
          422
        );

      const directory =
        req.body.type === FileType.IMAGE
          ? `image-uploads/${firebaseId}`
          : `uploads/${firebaseId}`;
      const storageMiddleware = createUploadMiddleware(directory);

      return storageMiddleware.single('file')(req, res, (e) => {
        if (!e) return next();

        handleHttpError(e, res);
      });
    } catch (error: any) {
      handleHttpError(error, res);
      if (error instanceof HttpError && error.status <= 499) return;
      logError(error);
    }
  };

  private deleteFile: Middleware = async (req, res, next) => {
    try {
      const file: any = await this.fileModel.findByPk(req.params.id);

      if (!file) throw new HttpError('File does not exist', 404);

      if ([FileStatus.PROCESSING, FileStatus.PENDING].includes(file.status))
        throw new HttpError('Please wait for file to finish processing', 400);

      await deleteObject(file.path);
      await redis.client.del(`file_ingest:${file.id}`);

      next();
    } catch (error: any) {
      handleHttpError(error, res);
    }
  };

  private fileUploadStatFromCache: Middleware = async (req, res, next) => {
    try {
      const fileId = req.params.id;
      const redisKey = `file_ingest:${fileId}`;

      const result = await redis.client.get(redisKey);

      if (!result) return next();

      if (
        [FileStatus.FAILED, FileStatus.PROCESSED].includes(
          String(result) as any
        )
      ) {
        this.fileModel
          .update({ status: String(result) }, { where: { id: fileId } })
          .then(() => {
            redis.client.del(redisKey);
          })
          .catch(logError);
      }

      return res.send({
        data: {
          id: fileId,
          status: String(result)
        }
      });
    } catch (error: any) {
      handleHttpError(error, res);
    }
  };
}
