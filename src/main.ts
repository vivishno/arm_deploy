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
        switch (scope){
            case "resource_group":
                await deployscope_resource_group();
                break;
            case "subscription":
                await deployscope_subscription();
                break;
            case "management_group":
                deployscope_management_group();
                break;
            case "tenant":
                await deployscope_tenant()
                break;
        }
        // get the input params
        

    }
    finally{

    }
       
}

async function deployscope_resource_group(){
    let resource_group = core.getInput('resource_group',{required:true})
    let validation_prefix = "deployment group validate "
    let deployment_prefix = "deployment group create "
    let command = getCommandToExecute();
    
    var validation_command = validation_prefix + command + " -o json --query error"; 
    var validation_result = await executeAzCliCommand(`${validation_command}`);
    try{
        if (validation_result.status == 0){
            // this validation has passed 
            var deployment_command = deployment_prefix + command + " -o json --query properties.outputs";
            var deployment_result = await executeAzCliCommand(`${deployment_command}`);
            if (deployment_result.status != 0){
                // command was not successful
                isArmDeploymentSuccess = false;
                core.info("deployment_result : " + deployment_data);
            }
            else{
                isArmDeploymentSuccess = true;
                var deployment_data = deployment_result.data;
                core.info("deployment_result : " + deployment_data);
            }
        }
        else{
            core.setOutput("deployment_result", validation_result.data)
        }
            
        core.setOutput("deployment_status ", ""+isArmDeploymentSuccess);
    } finally {
    
    }
}

function deployscope_subscription(){

}

function deployscope_management_group(){

}

function deployscope_tenant(){

}

function getCommandToExecute(){
    let resource_group = core.getInput('resource_group',{required:true})
    let mode = core.getInput('mode',{required:false})
    let name = core.getInput('name',{required:false})
    let rollback_on_error = core.getInput('rollback_on_error',{required:false})
    let template_file = core.getInput('template_file',{required:true})
    let parameter_file = core.getInput('parameter_file',{required:false})
    let parameters = core.getInput('parameters',{required:false})
    
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
        rollback_on_error ? `--rollback_on_error ${rollback_on_error}` : undefined,
        template_param_path ? `--parameters ${template_param_path}` : undefined,
        parameters ? `--parameters ${parameters}` : undefined
    ].filter(Boolean).join(' ');

     return command;
}


async function executeAzCliCommand(command: string, silent?: boolean) {
    try {
        let myOutput = '';
        let status = 1;
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
                core.info("success : " + JSON.stringify(result));
                status = result;
                },(reason)=>{
                    core.info("rejected : " + JSON.stringify(reason));
                    status = reason;
                    });
        return {data:myOutput,status:status};
    }
    catch(error) {
        throw new Error(error);
    }
}

main();