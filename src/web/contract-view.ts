import * as vscode from 'vscode';
import { aelf, AElf } from './common';

export const contractView = (context: vscode.ExtensionContext) =>
  vscode.commands.registerCommand(
    "aelf-contract-build.openContractViewer",
    async () => {
      let contractAddress = context.globalState.get("deployedContractAddress");

      if (!contractAddress) {
        const input = await vscode.window.showInputBox({
          placeHolder: "Enter the contract address",
        });

        if (input) {
          context.globalState.update("deployedContractAddress", input);
          contractAddress = input;
        } else {
          vscode.window.showWarningMessage("No contract address entered.");
        }
      }

      if (typeof contractAddress === 'string') {
        const methods = await getContractMethods(aelf, contractAddress);
        const outputChannel = vscode.window.createOutputChannel("Contract Methods");
        outputChannel.clear();
        outputChannel.appendLine(`Contract Address: ${contractAddress}`);
        outputChannel.appendLine("Methods:");
        Object.entries(methods).forEach(([methodName, val]) => {
          outputChannel.appendLine(`- ${methodName} - ${JSON.stringify(val)}`);
        });
        outputChannel.show();
      }
    }
  );

// https://github.com/Portkey-Wallet/portkey-web/blob/master/packages/contracts/src/utils/index.ts

const getServicesFromFileDescriptors = (descriptors: any) => {
  // @ts-expect-error
  const root = AElf.pbjs.Root.fromDescriptor(descriptors, 'proto3').resolveAll();
  return descriptors.file
    .filter((f: { service: string | any[] }) => f.service.length > 0)
    .map((f: { service: { name: any }[]; package: any }) => {
      const sn = f.service[0].name;
      const fullName = f.package ? `${f.package}.${sn}` : sn;
      return root.lookupService(fullName);
    });
};

const getFileDescriptorsSet = async (instance: any, contractAddress: string) => {
  const fds = await instance.chain.getContractFileDescriptorSet(contractAddress);
  return getServicesFromFileDescriptors(fds);
};

const methodsMap: { [key: string]: any } = {};

async function getContractMethods(instance: any, address: string) {
  const key = instance.currentProvider.host + address;
  if (!methodsMap[key]) {
    const methods = await getFileDescriptorsSet(instance, address);
    const _obj: any = {};
    Object.keys(methods).forEach(key => {
      const service = methods[key];
      Object.keys(service.methods).forEach(key => {
        const method = service.methods[key].resolve();
        _obj[method.name] = method.resolvedRequestType;
      });
    });
    methodsMap[key] = _obj;
  }
  return methodsMap[key];
}