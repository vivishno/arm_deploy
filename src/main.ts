import * as core from '@actions/core';
import * as crypto from "crypto";
import * as exec from '@actions/exec';
import * as io from '@actions/io';

import { FormatType, SecretParser } from 'actions-secret-parser';

var azPath: string;
var prefix = !!process.env.AZURE_HTTP_USER_AGENT ? `${process.env.AZURE_HTTP_USER_AGENT}` : "";
var azPSHostEnv = !!process.env.AZUREPS_HOST_ENVIRONMENT ? `${process.env.AZUREPS_HOST_ENVIRONMENT}` : "";
var workspacePath = !!process.env.GITHUB_WORKSPACE ? `${process.env.GITHUB_WORKSPACE}`:"";
async function main() {
    try {
        // Set user agent variable
        var isAzCLISuccess = false;
        let usrAgentRepo = crypto.createHash('sha256').update(`${process.env.GITHUB_REPOSITORY}`).digest('hex');
        let actionName = 'AzureLogin';
        let userAgentString = (!!prefix ? `${prefix}+` : '') + `GITHUBACTIONS/${actionName}@v1_${usrAgentRepo}`;
        let azurePSHostEnv = (!!azPSHostEnv ? `${azPSHostEnv}+` : '') + `GITHUBACTIONS/${actionName}@v1_${usrAgentRepo}`;
        core.exportVariable('AZURE_HTTP_USER_AGENT', userAgentString);
        core.exportVariable('AZUREPS_HOST_ENVIRONMENT', azurePSHostEnv);
        let resource_group = core.getInput('resource_group',{required:true})
        azPath = await io.which("az", true);
        await executeAzCliCommand("--version");
        let template_path = `${workspacePath}` + "/.cloud/.azure/arm_deploy.json";
        let template_param_path = `${workspacePath}` + "/.cloud/.azure/arm_deploy.params.json";
        let command = "group deployment validate -g ashkuma_functionAppRsGroup --template-file " + `${template_path}` + " --parameters " + `${template_param_path}` + " -o json";
        await executeAzCliCommand(`${command}`);
    
    } finally {
        // Reset AZURE_HTTP_USER_AGENT
        core.exportVariable('AZURE_HTTP_USER_AGENT', prefix);
        core.exportVariable('AZUREPS_HOST_ENVIRONMENT', azPSHostEnv);
    }
}

async function executeAzCliCommand(command: string, silent?: boolean) {
    try {
        await exec.exec(`"${azPath}" ${command}`, [],  {silent: !!silent}); 
    }
    catch(error) {
        throw new Error(error);
    }
}

main();