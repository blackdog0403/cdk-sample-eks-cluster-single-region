// import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ClusterStack } from '../lib/cluster-stack';
import { ContainerStack } from '../lib/container-stack';
// import { CicdStack } from '../lib/cicd-stack';
const app = new cdk.App();

const account = app.node.tryGetContext('account') || process.env.CDK_INTEG_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT;
const clusterRegion = {account: account, region: 'ap-northeast-1'};

const primaryCluster = new ClusterStack(app, `ClusterStack-${clusterRegion.region}`, {env: clusterRegion })
new ContainerStack(app, `ContainerStack-${clusterRegion.region}`, {env: clusterRegion, cluster: primaryCluster.cluster });
