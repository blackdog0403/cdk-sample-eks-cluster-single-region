# CDK SAMPLE EKS Cluster Single Region STACK

본 프로젝트는 CDK 이용하여 AWS게정에 EKS Cluster를 구성해주는 프로젝트이다.

## 사전준비사항
- [AWS CLI를 설치하고](https://docs.aws.amazon.com/ko_kr/cli/latest/userguide/install-cliv2.html) AWS 계정 및  [Administrator 권한을 가진 IAM user의 credential을 셋업](https://cdk-eks-devops.workshop.aws/ko/20-preq/200-account.html)
- [nodejs 설치](https://nodejs.org/en/download/package-manager/)
- [cdk 설치](https://docs.aws.amazon.com/cdk/latest/guide/cli.html)

> `AWS CLI를 통해서 설정한 리전에 클러스터가 설치되니 원하는 리전을 설정하였는지 다시 한번 확인한다`

## 사용법

형상을 내려받고 npm으로 관련 라이브러리를 설치한다.

```bash
git clone https://github.com/blackdog0403/cdk-sample-eks-cluster-single-region.git # 형상 클론

cd cdk-sample-eks-cluster-single-region 

npm install
```

IDE로 프로젝트 루트 디렉토리 아래의 bin/multi-cluster-ts.ts 파일에 있는 Region 정보를 자신 개발 컴퓨터에 설정한 AWS 계정 정보에 맞춰서 수정한다. 본 예제는 ap-northeast-1으로 설정되어있다. `이 설정은 클러스터 명과 설정을 읽어들이는 폴더에 관련된 설정이지 실제로 클러스터가 설치되는 리전과 무방하다`

```typescript
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

```

> 위에서 리전을 변경하였다면 cdk-sample-eks-cluster-single-region/yaml-ap-northeast-1 폴더의 폴더명도 자신이 선택한 리전에 맞추어서 cdk-sample-eks-cluster-single-region/yaml-ap-northeast-2 와 같은 형식으로 변경해야 한다.

## (옵션) Gitops 를 사용하는 경우

Gitops를 사용하기 위해 fluxcd 및 관련 컴포넌트를 설치를 해야하는 경우 lib/container-stack.ts 파일을 아래와 같이 편집한다

```typescript

... 생략 ...
    const fluxcdrepo = 'https://charts.fluxcd.io/';
    const githubRepo = 'git@github.com:blackdog0403/hello-cdk8s' 
    // 위의 githubRepo 변수를 'git@github.com:{본인의깃헙ID}/cdk8s-demo 로 적절히 수정할 것
    
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
... 생략 ...

```


수정을 완료하고 나면 다음의 커맨드를 통해서 typescript를 빌드하고 cloud formation 템플릿을 생성하여 AWS 계정에 리소스를 생성합니다. 

```bash
npm run build # 에러가 발생하지 않았다면 정상적으로 코딩이 된 걸 확인 가능.
cdk synth # 코드를 cloud formatinon으로 변환하여 출력한다.
cdk diff # 실제로 반영할 변경점에 대해서 확인.
```

terminal 통해서 출력이 되는 것을 확인해서 어떤 부분이 반영될지를 확인하고 나서 다음의 명령어로 실제로 반영합니다.

```bash
cdk list # 어떤 스택이 있는지 확인 
cdk deploy "*" --require-approval=never  # 승인 절차 없이 모든 스택을 반영한다.
```

에러없이 정상적으로 실행이 끝났다면 AWS Console에 접속하여 EKS 클러스터가 정상적으로 생성되었는지 확인한다.


## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
