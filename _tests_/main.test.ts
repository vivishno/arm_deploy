
import * as core from '@actions/core';
import * as crypto from "crypto";
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import { main } from '../../src/main.ts';
describe('Testing initialize', () => {
    let m: main;
    test('TEST', async () => {
        core.setOutput('scope', 'resource_group');
        eSpy = jest.spyOn(m, 'main');
        await m.main();
        expect(eSpy).toHaveBeenCalled();
    });
});
