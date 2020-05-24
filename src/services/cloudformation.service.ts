import { Subject } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { FileSystemService } from './file-system.service';
const cfnDeploy = require('cfn-deploy');

export interface CloudFormationDeployEvent {
  status: 'started' | 'progress' | 'error' | 'complete';
  details?: any;
}

export interface CloudFormationDeployOptions {
  stackname: string;
  region: string;
  packageBucket: string;
  profile?: string;
  template?: string;
  templateString?: string;
  parameters?: string;
  tags?: string;
  skipBuild?: boolean;
}

@Injectable()
export class CloudFormationService {
  constructor(private readonly fileSystem: FileSystemService) {}

  deploy(options: CloudFormationDeployOptions) {
    return this.cfnDeploy(options);
  }

  async package(options: CloudFormationDeployOptions) {
    const outputFile = this.getOutputTemplateFileName(options.template);
    const command = [
      `aws cloudformation package`,
      `--template-file "${options.template}"`,
      `--s3-bucket ${options.packageBucket}`,
      `--output-template-file "${outputFile}"`,
      options.profile?.length ? `--profile ${options.profile}` : ``,
    ].join(' ');

    await this.runCommand(command);

    return outputFile;
  }

  private getOutputTemplateFileName(templateFile: string) {
    const fileNameSplits = templateFile.split('.');
    const fileNameExtension = fileNameSplits.pop();
    fileNameSplits.push(`packaged.${fileNameExtension}`);
    return fileNameSplits.join('.');
  }

  private cfnDeploy(params: any) {
    const eventStream = cfnDeploy(params);

    const deployProgress = new Subject<CloudFormationDeployEvent>();

    eventStream.on('EXECUTING_CHANGESET', () => {
      deployProgress.next({ status: 'progress' });
    });
    eventStream.on('COMPLETE', () => {
      deployProgress.next({ status: 'complete' });
    });
    eventStream.on('ERROR', (err: any) => {
      deployProgress.next({ status: 'error', details: err });
    });

    deployProgress.next({ status: 'started' });

    return deployProgress;
  }

  private runCommand(cmd: string) {
    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.warn(error);
        }
        resolve(stdout ? stdout : stderr);
      });
    });
  }
}
