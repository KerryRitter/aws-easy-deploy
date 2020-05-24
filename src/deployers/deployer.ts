import { CloudFormationDeployOptions } from '../services';

export interface Deployer {
  deploy(options: CloudFormationDeployOptions): Promise<void>;
}
