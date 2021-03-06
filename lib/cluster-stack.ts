import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as eks from '@aws-cdk/aws-eks';
import * as ec2 from '@aws-cdk/aws-ec2';
import { PhysicalName } from '@aws-cdk/core';

export class ClusterStack extends cdk.Stack {
  
  public readonly cluster: eks.Cluster;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const clusterName ='cdk8s-demo';

    const clusterAdminRole = new iam.Role(this, 'AdminRole', {
      assumedBy: new iam.AccountRootPrincipal()
    });

    const cluster = new eks.Cluster(this, 'cdk8s-demo-cluster', {
      clusterName: clusterName,
      mastersRole: clusterAdminRole,
    
      version: eks.KubernetesVersion.V1_16,
      defaultCapacity: 2
    });

    // const clusterRegion = 'ap-northeast-1';
    // cluster.addCapacity('spot-group', {
    //   instanceType: new ec2.InstanceType('m5.xlarge'),
    //   spotPrice: cdk.Stack.of(this).region==clusterRegion ? '0.248' : '0.192'
    // });

    this.cluster = cluster;

  }
}

function createDeployRole(scope: cdk.Construct, id: string, cluster: eks.Cluster): iam.Role {
  const role = new iam.Role(scope, id, {
    roleName: PhysicalName.GENERATE_IF_NEEDED,
    assumedBy: new iam.AccountRootPrincipal()
  });

  cluster.awsAuth.addMastersRole(role);
  return role;
}
export interface EksProps extends cdk.StackProps {
  cluster: eks.Cluster
}

