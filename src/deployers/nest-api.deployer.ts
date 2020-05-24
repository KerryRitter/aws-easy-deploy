import { Deployer } from './deployer';
import { Injectable } from '@nestjs/common';
import { FileSystemService, NpmService, CloudFormationService, CloudFormationDeployOptions } from '../services';
import { ActionBase } from 'cli-ux';

interface NestApiCloudFormationDeployOptions extends CloudFormationDeployOptions {
  codeUri: string;
}

@Injectable()
export class NestApiDeployer implements Deployer {
  constructor(
    private readonly cfn: CloudFormationService,
    private readonly fileSystem: FileSystemService,
    private readonly npm: NpmService,
    private readonly action: ActionBase,
  ) {}

  async deploy(options: NestApiCloudFormationDeployOptions) {
    // The artifact needs to be in the same folder as the template URL.
    let artifactsFileName = options.codeUri ?? 'deploy-artifacts.zip';
    if (options.template?.length) {
      const templatePathSplits = options.template.split('/');
      options.template = templatePathSplits.join('\\');
      templatePathSplits.pop();
      artifactsFileName = [
        ...templatePathSplits,
        artifactsFileName,
      ].join('\\');
    }
  
    // Start tracking temp files we need to clear out at the end.
    const tempFiles = [];

    // Sometimes you just want to redploy!
    if (!options.skipBuild) {
      this.action.start('Clean install...');
      // "Protecting" node_modules means being able to restore the dev back
      // to their original state, since we prune --production and it's annoying
      // to have to re-install again after deployments. 
      await this.protectNodeModules();

      await this.npm.cleanInstall();
  
      this.action.start('Linting...');
      try {
        await this.npm.runScript('lint');
      } catch (ex) {
        // TODO: Alert the user, and/or back out of the process.
      }
  
      this.action.start('Building...');
      try {
        await this.npm.runScript('build');
      } catch (ex) {
        // TODO: Alert the user, and back out of the process.
      }
  
      this.action.start('Pruning...');
      try {
        await this.npm.prune(true);
      } catch (ex) {
        // TODO: Alert the user, and/or back out of the process.
      }
  
      this.action.start('Zipping...');
      // Zip up to the CodeURI path and track this file for clearing at the end.
      await this.fileSystem.zipFolder(
        this.fileSystem.getCwdPath('dist'),
        this.fileSystem.getCwdPath(artifactsFileName));
      tempFiles.push(this.fileSystem.getCwdPath(artifactsFileName));
    }

    this.action.start('Packaging...');
    if (options.template?.length) {
      // Use a full path to the template (mostly to make it easy to dev against)
      options.template = this.fileSystem.getCwdPath(options.template);
      // Package the SAM template for release.
      options.template = await this.cfn.package(options);
      // Track the new "packaged" template so we can clear it out at the end.
      tempFiles.push(options.template);
    }

    this.action.start('Deploying...');
    await new Promise((resolve, reject) => {
      this.action.start('Deploying...');
      this.cfn.deploy(options).subscribe(e => {
        if (e.status === 'error') {
          this.action.stop('Error deploying.');
          reject(e.details);
        } else if (e.status === 'complete') {
          resolve();
        }
      });
    });

    this.action.start('Restoring node_modules...');
    // Put the old node_modules back so the dev can go back to work :)
    await this.restoreNodeModules();
    
    this.action.start('Cleaning up...');
    await Promise.all(tempFiles.map(f => this.fileSystem.delete(f)));
    
    this.action.stop('Done!');
  }

  private async protectNodeModules() {
    await this.fileSystem.delete(
      this.fileSystem.getCwdPath('_node_modules'),
    );

    if (this.fileSystem.exists(this.fileSystem.getCwdPath('node_modules'))) {
      try {
        this.fileSystem.rename(
          this.fileSystem.getCwdPath('node_modules'), 
          this.fileSystem.getCwdPath('_node_modules'));
      } catch (ex) {
        // todo tell the user about it
      }
    }
  }

  private async restoreNodeModules() {
    await this.fileSystem.delete(
      this.fileSystem.getCwdPath('node_modules'),
    );
    
    if (this.fileSystem.exists(this.fileSystem.getCwdPath('_node_modules'))) {
      try {
        this.fileSystem.rename(
          this.fileSystem.getCwdPath('_node_modules'), 
          this.fileSystem.getCwdPath('node_modules'));
      } catch (ex) {
        // todo tell the user about it
      }
    }
  }
}
