import * as core from '@actions/core';
import * as crypto from "crypto";
import * as exec from '@actions/exec';
import * as io from '@actions/io';

import { FormatType, SecretParser } from 'actions-secret-parser';
import { ExecOptions } from 'child_process';
import { stat } from 'fs';

var azPath: string;
var isArmDeploymentSuccess = false;
var workspacePath = !!process.env.GITHUB_WORKSPACE ? `${process.env.GITHUB_WORKSPACE}`:"";
async function main() {
    try {
        
        azPath = await io.which("az", true);
        await executeAzCliCommand("--version");

        let scope = core.getInput('scope',{required:true})
        let validation_prefix = ""
        let deployment_prefix = ""
        switch (scope){
            case "resource_group":
                validation_prefix = "deployment group validate "
                deployment_prefix = "deployment group create "
                await deployscope(validation_prefix,deployment_prefix);
                break;
            case "subscription":
                validation_prefix = "deployment sub validate "
                deployment_prefix = "deployment sub create "
                await deployscope(validation_prefix,deployment_prefix);
                break;
            case "management_group":
                validation_prefix = "deployment mg validate "
                deployment_prefix = "deployment mg create "
                await deployscope(validation_prefix,deployment_prefix);
                break;
            case "tenant":
                validation_prefix = "deployment tenant validate "
                deployment_prefix = "deployment tenant create "
                await deployscope(validation_prefix,deployment_prefix);
                break;
        }
    }
    finally{

    }
       
}

async function deployscope(validation_prefix,deployment_prefix){
    let command = getCommandToExecute();
    
    var validation_command = validation_prefix + command + " -o json"; 
    var validation_result = await executeAzCliCommand(`${validation_command}`);
    core.info("validation result : " + JSON.stringify(validation_result))
    try{
        if (validation_result.status == 0){
            // this validation has passed 
            var deployment_command = deployment_prefix + command + " -o json --query properties.outputResources";
            var deployment_result = await executeAzCliCommand(`${deployment_command}`);
            if (deployment_result.status != 0){
                // command was not successful
                isArmDeploymentSuccess = false;
                core.setOutput("deployment_result", deployment_result.data)
            }
            else{
                isArmDeploymentSuccess = true;
                var deployment_data = deployment_result.data;
                core.setOutput("deployment_result" , deployment_data);
            }
        }
        else{
            core.setOutput("deployment_result", validation_result.data)
        }
    } finally {
        core.setOutput("deployment_status", ""+isArmDeploymentSuccess);
    }

    core.setOutput("deployment_status", ""+isArmDeploymentSuccess);
    core.info("---------------ACTION DONE--------------------")
}

function getCommandToExecute(){
    let resource_group = core.getInput('resource_group',{required:false})
    let mode = core.getInput('mode',{required:false})
    let name = core.getInput('name',{required:false})
    let rollback_on_error = core.getInput('rollback_on_error',{required:false})
    let template_file = core.getInput('template_file',{required:true})
    let parameter_file = core.getInput('parameter_file',{required:false})
    let parameters = core.getInput('parameters',{required:false})
    let location = core.getInput("location",{required:false})
    let management_group_id = core.getInput("management_group_id", {required:false})

    let template_path = `${workspacePath}` + `${template_file}`;
    let template_param_path = undefined
    if (parameter_file){
        template_param_path = `${workspacePath}` + `${parameter_file}`;
    }

    const command = [
        resource_group ? `--resource-group ${resource_group}` : undefined,
        template_path ? `--template-file ${template_path}` : undefined,
        mode ? `--mode ${mode}` : undefined,
        name ? `--name ${name}` : undefined,
        location ? `--location ${location}` : undefined,
        management_group_id ? `--management-group-id ${management_group_id}` : undefined,
        rollback_on_error ? `--rollback_on_error ${rollback_on_error}` : undefined,
        template_param_path ? `--parameters ${template_param_path}` : undefined,
        parameters ? `--parameters ${parameters}` : undefined
    ].filter(Boolean).join(' ');

     return command;
}


async function executeAzCliCommand(command: string, silent?: boolean) {
    try {
        let myOutput = '';
        let status:any = 1;
        const options:any = {};
        options.listeners = {
            stdout: (data: Buffer) => {
                myOutput = data.toString();
            },
            stderr: (data: Buffer) => {
                myOutput = data.toString();
            }
        };
        options.silent =!!silent;
        await exec.exec(`"${azPath}" ${command}`, [], options).then(
            (result) => {
                status = result;
                },(reason)=>{
                    status = JSON.stringify(reason);
                    });
        core.info("myoutput : " + myOutput);
        core.info("status : " + status);
        return {data:myOutput,status:status};
    }
    catch(error) {
        throw new Error(error);
    }
}

main();