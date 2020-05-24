import { S3 } from 'aws-sdk';
import { Subject } from 'rxjs';

export interface S3SyncEvent {
  status: 'progress' | 'error' | 'complete';
  details: any;
}

export class S3Service {
  private readonly s3 = require('@auth0/s3').createClient({
    s3Client: new S3({
      apiVersion: '2006-03-01',
    }),
  });

  syncFolderToBucket(localDirectoryPath: string, bucketName: string) {
    const uploader = this.s3.uploadDir({
      localDir: localDirectoryPath,
      deleteRemoved: true,
      s3Params: {
        Bucket: bucketName,
        Prefix: '',
      },
    });

    const syncProgress = new Subject<S3SyncEvent>();

    uploader.on('error', (err: any) => {
      syncProgress.next({ status: 'error', details: err });
    });

    uploader.on('progress', () => {
      syncProgress.next({
        status: 'progress',
        details: {
          progressAmount: uploader.progressAmount,
          progressTotal: uploader.progressTotal,
        },
      });
    });

    uploader.on('end', () => {
      syncProgress.next({ status: 'complete', details: null });
    });

    return syncProgress;
  }
}
