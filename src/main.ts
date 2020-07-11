import * as core from '@actions/core';
import * as crypto from "crypto";
import * as exec from '@actions/exec';
import * as io from '@actions/io';

import { FormatType, SecretParser } from 'actions-secret-parser';

var azPath: string;
var workspacePath = !!process.env.GITHUB_WORKSPACE ? `${process.env.GITHUB_WORKSPACE}`:"";
async function main() {
    try {
        // Set user agent variable
        var isArmDeploymentSuccess = false;
        let usrAgentRepo = crypto.createHash('sha256').update(`${process.env.GITHUB_REPOSITORY}`).digest('hex');
        let actionName = 'ArmDeploy';

        // get the input params
        let resource_group = core.getInput('resource_group',{required:true})

        azPath = await io.which("az", true);
        await executeAzCliCommand("--version");

        let validation_command = "deployment group validate " + "-g " + `${resource_group}`
        let deployment_command = "deployment group create " + "-g " + `${resource_group}`
        let command = getCommandToExecute();
        
        command = validation_command + command + " -o json"; 
        var deploy_result = await executeAzCliCommand(`${command}`);
    
    } finally {
       
    }
}

function getCommandToExecute(){
    var command = " ";
    
    let mode = core.getInput('mode',{required:false})
    let name = core.getInput('name',{required:false})
    let rollback_on_error = core.getInput('rollback_on_error',{required:false})
    let template_file = core.getInput('template_file',{required:true})
    let parameter_file = core.getInput('parameter_file',{required:false})
    let parameters = core.getInput('parameters',{required:false})

    let template_path = `${workspacePath}` + `${template_file}`;

    if (mode){
        command = command + " --mode " + `${mode}`
    }
    
    if(!name){
        name = `${process.env.GITHUB_REPOSITORY}`;
        name = name.replace("/",'_');
    }

    command = command + " --name " + `${name}`;

    if(rollback_on_error){
        command = command + " --rollback_on_error " + `${rollback_on_error}`;
    }

    command = command + " --template-file " + `${template_path}`;

    if (parameter_file){
        let template_param_path = `${workspacePath}` + `${parameter_file}`;
        command = command +  " --parameters " + `${template_param_path}`;
    }

    if (parameters){
        command = command + " --parameters " + `${parameters}`;
    }

    return command;
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