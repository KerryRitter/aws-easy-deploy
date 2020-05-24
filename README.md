# aws-easy-deploy

## Project Vision

Someone should be able to run `(nest new | ng new | ionic start) && aws-easy-deploy` and have a running serverless application in AWS. This CLI should be largely opinionated, but offer enough flexibility.

## Current Goal

The current goal is to be able to feed a CloudFormation file and some parameters to get deployment working. 

For example:

```
aws-easy-deploy --template=cfn/my-app-cfn.yaml \
  --stackname=my-app-dev \
  --profile=my-profile \
  --region=us-east-2 \
  --packageBucket=my-cloudformation \
  --parameters=cfn/dev-parameters.json \
  --tags=cfn/dev-tags.json
```

## End Goal

The "end goal" is to have a number of opinionated deployers so the "norm" is to pass a "type" parameter and not require any deep AWS knowledge. Using flags or wizards seem reasonable, or using some sort of initialization questionnaire to setup the config. 

Flag example:

```
aws-easy-deploy --type=nest-api \
  --stackname=my-app-dev \
  --profile=my-profile \
  --region=us-east-2 \
  --packageBucket=my-cloudformation \
  --parameters=cfn/dev-parameters.json \
  --tags=cfn/dev-tags.json
```

JSON file example (aws-easy-deploy would then sniff the config, build a cfn template in memory and deploy using that):

```
{
  "type": "nest-api",
  "stackname": "my-app-dev",
  "profile": "my-profile",
  "region": "us-east-2",
  "packageBucket": "my-cloudformation",
  "parameters": "cfn/dev-parameters.json",
  "tags": "cfn/dev-tags.json"
}
```

## Current Challenges

1. Managing certificates: Certificates have to be created to support SSL, and it isn't a super-straightforward maintenance plan from my experience.

2. Creating hosted zones: Ideally the user can pass in a domain name and the hosted name gets created, but this might get sticky managing DNS.

3. CloudFormation extendability: What's the best way to do this? I would like to allow extendability of these default "no-knowledge-required" templates, but also keeping things simple.

## Todo

1. Get the Nest API deployer working. Right now, it kinda works when given a good CloudFormation, but it's not perfect.

2. Abstract the Nest API deployer to make it easier to extend the deployer library.

3. Get Angular deployer working.

4. Get Ionic deployer working.

## Want to help?

Reach out to Kerry Ritter. I'm looking for someone to help me drive this project to an alpha state (and further!) of completion but I have some higher priority projects I've started to take on. Reach out to me via email (ritter@kerryritter.com) and Twitter @kerryritter.