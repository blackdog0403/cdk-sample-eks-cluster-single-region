import { HelmChart } from '@aws-cdk/aws-eks';
import * as cdk from '@aws-cdk/core';
import { readYamlFromDir } from '../utils/read-file';
import { EksProps } from './cluster-stack'; 

export class ContainerStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: EksProps) {
    super(scope, id, props);

    const cluster = props.cluster;
    const commonFolder = './yaml-common/';
    const regionFolder = `./yaml-${cdk.Stack.of(this).region}/`;

    readYamlFromDir(commonFolder, cluster);
    readYamlFromDir(regionFolder, cluster);

    const stable = 'https://kubernetes-charts.storage.googleapis.com/';

    cluster.addChart(`metrics-server`, {
      repository: stable,
      chart: 'metrics-server',
      release: 'metrics-server',
      namespace: 'metrics',
      createNamespace: true
      // values: {
      //   'helm.versions': 'v3',
      //   'skdj': 'tset', 
      // }
    //   readonly values?: {
    //     [key: string]: any;
    // };

    });


    const fluxcd = 'https://charts.fluxcd.io';

  }
}


