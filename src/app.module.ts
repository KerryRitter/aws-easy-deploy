import { Module } from '@nestjs/common';
import { cli, ActionBase } from 'cli-ux';
import {
  CloudFormationService,
  S3Service,
  FileSystemService,
  NpmService,
} from './services';
import { NestApiDeployer } from './deployers/nest-api.deployer';

@Module({
  providers: [
    CloudFormationService,
    S3Service,
    {
      provide: ActionBase,
      useValue: cli.action,
    },
    NpmService,
    FileSystemService,

    NestApiDeployer,
  ],
  exports: [NestApiDeployer],
})
export class AppModule {}
