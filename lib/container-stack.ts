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
    const githubuser = 'blackdog0403';

    readYamlFromDir(commonFolder, cluster);
    readYamlFromDir(regionFolder, cluster);

    const stable = 'https://charts.helm.sh/stable/' // 'https://kubernetes-charts.storage.googleapis.com/';

    cluster.addChart(`metrics-server`, {
      repository: stable,
      chart: 'metrics-server',
      release: 'metrics-server',
      version: '2.11.2',
      namespace: 'metrics',
      createNamespace: true,
    });

    const fluxcdrepo = 'https://charts.fluxcd.io/';
    const githubRepo = 'git@github.com:blackdog0403/hello-cdk8s' // 'git@github.com:{본인의ID}/cdk8s-demo 로 수정할 것!
    

    cluster.addChart('fluxcd', {
      repository: fluxcdrepo,
      chart: 'flux',
      release: 'flux',
      namespace: 'flux',
      createNamespace:true,
      values: {
        git: {
          url: githubRepo ,
          path: 'dist'
        }
      }
    });

    cluster.addChart('helm-operator', {
      repository: fluxcdrepo,
      chart: 'helm-operator',
      release: 'helm-operator',
      namespace:'flux',
      createNamespace: true,
      values: {
        helm: {
          versions : 'v3'
        },
        git: {
          ssh: {
            secretName: 'flux-git-deploy'
          }
        }
      },
    });
  }
}


