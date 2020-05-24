import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as yargs from 'yargs';
import { NestApiDeployer } from './deployers/nest-api.deployer';

export async function run() {
  if (!yargs.argv.stackname?.toString()?.trim()?.length) {
    throw new Error('stackname is required.');
  }

  if (!yargs.argv.region?.toString()?.trim()?.length) {
    throw new Error('region is required.');
  }

  if (!yargs.argv.packageBucket?.toString()?.trim()?.length) {
    throw new Error('packageBucket is required.');
  }

  const app = await NestFactory.createApplicationContext(AppModule);

  const deployer = app.get<NestApiDeployer>(NestApiDeployer);

  await deployer.deploy(yargs.argv as any);
}
