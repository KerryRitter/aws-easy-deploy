import { Injectable } from '@nestjs/common';
import {
  CloudFormationService,
  S3Service,
  CloudFormationDeployOptions,
} from '../services';
import { ActionBase } from 'cli-ux';

@Injectable()
export class AngularUiDeployer {
  constructor(
    private readonly cfn: CloudFormationService,
    private readonly s3: S3Service,
    private readonly action: ActionBase,
  ) {}

  async deploy(options: CloudFormationDeployOptions) {
    // NOTE: This is some old code from a PoC I was working on. It should still work, but
    // it needs to enable the bucket to be CloudFronted, ideally with SSL and with an easy
    // way to set up a hosted zone alias for pretty URLs.

    // const stackName = 'temp';
    // const bucketName = 'temp3';
    // const localDirectoryPath = './site-dist';
    // const cfn = new CloudFormationService();
    // const s3 = new S3Service();
    // const templateJson = {
    //   Resources: {
    //     Bucket: {
    //       Type: 'AWS::S3::Bucket',
    //       Properties: {
    //         AccessControl: 'PublicRead',
    //         BucketName: bucketName,
    //       },
    //     },
    //   },
    // };
    // this.action.start('Creating stack...');
    // try {
    //   await new Promise((resolve, reject) => {
    //     cfn.deploy(stackName, templateJson).subscribe((e) => {
    //       if (e.status === 'error') {
    //         if (
    //           JSON.stringify(e.details?.message).includes(
    //             `The submitted information didn't contain changes`,
    //           )
    //         ) {
    //           return resolve();
    //         }
    //         return reject(e.details);
    //       }
    //       if (e.status === 'complete') {
    //         return resolve();
    //       }
    //     });
    //   });
    //   this.action.start('Uploading files...');
    //   await new Promise((resolve, reject) => {
    //     s3.syncFolderToBucket(localDirectoryPath, bucketName).subscribe((e) => {
    //       if (e.status === 'error') {
    //         return reject(e.details);
    //       }
    //       if (e.status === 'complete') {
    //         return resolve();
    //       }
    //     });
    //   });
    // } catch (ex) {
    //   console.log({ ex });
    // } finally {
    //   this.action.stop();
    // }
  }
}
