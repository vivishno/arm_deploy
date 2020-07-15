## GitHub Actions for deploying Azure resources using ARM templates

[GitHub Actions](https://help.github.com/en/articles/about-github-actions)  gives you the flexibility to build an automated software development lifecycle workflow. 

With [GitHub Actions for Azure](https://github.com/Azure/actions/) you can create workflows that you can set up in your repository to build, test, package, release and **deploy** to Azure. 

# GitHub Action for ARM Template Deployment
With the Azure Arm Deploy Action, you can automate your workflow to deploy resources to Azure  using your ARM templates.
You can target your deployment to a resource group, subscription, management group, or tenant.
But this action only targets deployment to a resource group.

Get started today with a [free Azure account](https://azure.com/free/open-source)!

This repository contains GitHub Action for [Azure ARM deploy](https://github.com/mlopstemplates/arm_deploy/blob/master/.github/workflows/ci.yml).

## Sample workflow that uses Azure Arm Deploy action to deploy at resource group

```yaml

# File: .github/workflows/ci.yml

on: [push]

name: AzureArmDeploySample

jobs:

  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    
    - uses: azure/login@v1.1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
    
    - name: deploy arm template
        id: arm_deploy
        uses: mlopstemplates/arm_deploy@master
        with:
            resource_group: "testgroup"
            template_file: "/.cloud/.azure/deploy.json"
            parameter_file: "/.cloud/.azure/deploy.params.json"
    
```


## Sample workflow that uses Azure Arm Deploy action to deploy at subscriptio level

```yaml

# File: .github/workflows/ci.yml

on: [push]

name: AzureArmDeploySample

jobs:

  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    
    - uses: azure/login@v1.1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
    
      - name: test action
        id: sampletest_sub
        uses: mlopstemplates/arm_deploy@master
        with:
            scope: "subscription"
            template_file: "/.cloud/.azure/deploy_sub.json"
            location: "southcentralus"
      
      - name: Display deployment output details
        run: |
          echo deployment_status: "${{ steps.sampletest_sub.outputs.deployment_status}}"
          echo deployment_error: "${{ steps.sampletest_sub.outputs.deployment_error}}"
    
```


## Dependency :

- [Azure Login Action](https://github.com/Azure/login)

## Action Input Parameters

| Input | Required | Default | Description |
| ----- | -------- | ------- | ----------- |
| scope | yes | - |Scope of deployment either of these < resource_group, subscription, management_group, tenant >|
| resource_group | yes | - | resource group to deploy the template to |
| location | no | - | location where deployment info has to be stored : Not required if deployment scope is resource_group |
| management_group_id | no | - | The management group id to create deployment at : only required when scope is management group |
| mode | no | Incremental | The deployment mode.  Allowed values: Complete, Incremental.  Default: Incremental. See [DeploymentModes](https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/deployment-modes) for details|
| name | no | - | The deployment name |
| rollback_on_error | no | - | The name of a deployment to roll back to on error, or use as a flag to roll back to the last successful deployment. |
| template_file | yes | - |  The path to the template file |
| parameter_file | no | - | The path to the parameters file.|
| parameters | no | - | the parameters directly as as <KEY=VALUE> pairs |


## Action Output Parameters
| Input | Required | Default | Description |
| ----- | -------- | ------- | ----------- |
| deployment_status | yes | - |Status of the deployment : true means sucess : false means failure|
| deployment_result | yes | - | deployment details json, showing all the deployed resources. In case of error it contains the error string |

# Azure ARM Deploy action metadata file

```yaml
# Deploy your ARM template at resource group level
name: 'Azure ARM Deploy'
description: 'Deploys an azure arm template to azure at a resource group level'
inputs: 
  scope:
    description: 'Scope of deployment either of these < resource_group, subscription, management_group, tenant >'
    required: true
  location:
    description: 'location where deployment has to happen: NOt required if deployment on resource group '
    required: true
  resource_group: 
    description: 'Resource group on which the resource has to be deployed : required when scope is resource group'
    required: false
  management_group_id:
    description: "The management group id to create deployment at : only required when scope is management group"
    required: false
  mode:
    description: 'The deployment mode.Allowed values: Complete, Incremental.  Default: Incremental.'
    required: false
    default: ''
  name:
    description: 'The deployment name.'
    required: false
    default: ''
  rollback_on_error:
    description: 'The name of a deployment to roll back to on error, or use as a flag to roll back to the last successful deployment.'
    required: false
    default: ''
  template_file: 
    description: 'The path to the template file'
    required: true
    default: ''
  parameter_file:
    description: 'The path to the parameters file'
    required: false
    default: ''
  parameters:
    description: 'the parameters directly as as <KEY=VALUE> pairs'
    required: false
    default: ''
outputs:
  deployment_status:
    description: 'Status of the deployment'
  deployment_result:
    description: 'deployment error details in case status is Failed'
branding:
  color: 'blue'
runs:
  using: 'node12'
  main: 'lib/main.js'

```

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
