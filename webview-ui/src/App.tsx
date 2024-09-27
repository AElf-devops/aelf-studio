import React, { useCallback, useEffect, useRef, useState } from 'react';
// import { vscode } from './utilities/vscode';
import { message } from 'antd';
import { createComponent } from '@lit/react';
import { VscodeButton } from '@vscode-elements/elements/dist/vscode-button/index.js';
import AElf from 'aelf-sdk';
import { IWalletInfo } from 'aelf-sdk/types/wallet';
import { getContractMethods } from '@portkey/contracts';
import NormalFormItem from './components/NormalFormItem';
import ReadWriteContract from './components/ReadWriteContract';
import { getAElf } from './utilities';
import { rpcs } from './common';
import { IMethod, ISelectOption } from './types';
import './index.css';

export const VSCodeButton = createComponent({
  tagName: 'vscode-button',
  elementClass: VscodeButton,
  react: React,
  events: {
    onactivate: 'activate',
    onchange: 'change',
  },
});

const DEFAULT_RPC = rpcs[0].value;

function App() {
  // function handleBuild() {
  //   vscode.postMessage({
  //     command: 'hello',
  //     text: 'Hey there partner! 🤠',
  //   });
  // }

  const [rpcOptions, setRpcOptions] = useState(rpcs);
  const [contractOptions, setContractOptions] = useState<ISelectOption[]>([]);
  const [rpc, setRpc] = useState(DEFAULT_RPC);
  const [contractAddress, setContractAddress] = useState('');
  const [contract, setContract] = useState<any>();
  const [writeMethods, setWriteMethods] = useState<IMethod[]>([]);
  const [readMethods, setReadMethods] = useState<IMethod[]>([]);
  const [wallet, setWallet] = useState<IWalletInfo>();
  const isGettingContractRef = useRef(false);

  const transferMethods = useCallback(
    async (methodsObj: any, rpcValue: string, contractAddressValue: string) => {
      let viewMethod: string[] = [];
      try {
        const response = await fetch(
          `${rpcValue}/api/contract/ContractViewMethodList?address=${contractAddressValue}`,
        );
        if (response.ok) {
          viewMethod = await response.json();
        } else {
          message.error('ContractViewMethodList error');
        }
      } catch (error) {
        message.error(`ContractViewMethodList error: ${error}`);
      }
      const res: IMethod[] = [];
      const readRes: IMethod[] = [];
      const keysArr = Object.keys(methodsObj);
      for (let i = 0; i < keysArr.length; i++) {
        const temp: any = {};
        temp.name = keysArr[i];
        const fields = methodsObj[keysArr[i]].fields;
        temp.input = Object.keys(fields).map((item) => {
          return {
            name: item,
            type: fields[item].type,
          };
        });
        const isRead = viewMethod.includes(temp.name);
        temp.type = !isRead ? 'write' : 'read';
        temp.fn = methodsObj[keysArr[i]];
        if (isRead) {
          readRes.push(temp);
        } else {
          res.push(temp);
        }
      }
      return {
        readMethods: readRes,
        writeMethods: res,
      };
    },
    [],
  );

  const getMethod = useCallback(
    async (
      rpcValue: string,
      contractAddressValue: string,
      walletValue: IWalletInfo,
    ) => {
      try {
        const aelfInstance = getAElf(rpcValue);
        const methods = await getContractMethods(
          aelfInstance,
          contractAddressValue,
        );
        const tempContract = await aelfInstance.chain.contractAt(
          contractAddressValue,
          walletValue,
          {},
        );
        setContract(tempContract);
        const { readMethods, writeMethods } = await transferMethods(
          methods,
          rpcValue,
          contractAddressValue,
        );
        setWriteMethods(writeMethods);
        setReadMethods(readMethods);
      } catch (error) {
        message.error(`Get methods error: ${error}`);
      }
    },
    [transferMethods],
  );

  const getContract = useCallback(
    async (rpcValue: string) => {
      const hide = message.loading('Get contract in progress..', 0);
      try {
        const aelfInstance = getAElf(rpcValue);
        const newWallet = AElf.wallet.createNewWallet();
        setWallet(newWallet);
        await fetch(
          `https://faucet.aelf.dev/api/claim?walletAddress=${newWallet.address}`,
          { method: 'POST' },
        );
        const tokenContractName = 'AElf.ContractNames.Token';
        const chainStatus = await aelfInstance.chain.getChainStatus();
        const GenesisContractAddress = chainStatus.GenesisContractAddress;
        const zeroContract = await aelfInstance.chain.contractAt(
          GenesisContractAddress,
          newWallet,
          {},
        );
        const tokenContractAddress =
          await zeroContract.GetContractAddressByName.call(
            AElf.utils.sha256(tokenContractName),
          );
        setContractOptions([
          { value: tokenContractAddress, label: 'Token Contract' },
        ]);
        setContractAddress(tokenContractAddress);
        await getMethod(rpcValue, tokenContractAddress, newWallet);
        message.success('Get contract success!');
      } catch (error) {
        message.error(`Get contract error: ${error}`);
      } finally {
        isGettingContractRef.current = false;
        hide();
      }
    },
    [getMethod],
  );

  useEffect(() => {
    if (isGettingContractRef.current) return;
    isGettingContractRef.current = true;
    getContract(DEFAULT_RPC);
  }, [getContract]);

  const handleRpcChange = (rpcValue: string) => {
    if (isGettingContractRef.current) return;
    isGettingContractRef.current = true;
    setRpc(rpcValue);
    getContract(rpcValue);
  };

  const handleContractChange = (contractAddressValue: string) => {
    setContractAddress(contractAddressValue);
    if (!wallet) return;
    getMethod(rpc, contractAddressValue, wallet);
  };

  return (
    <main>
      <header className="flex justify-center w-full py-4 text-[16px] font-bold align-middle border-b-2">
        Contract View
      </header>
      <div className="flex flex-col gap-6 p-4 w-full">
        <NormalFormItem
          options={rpcOptions}
          selectedItem={rpc}
          onOptionsChange={(options) => setRpcOptions(options)}
          onSelectChange={handleRpcChange}
          title="RPC"
          buttonText="add rpc"
          disabled={isGettingContractRef.current}
        />
        <NormalFormItem
          options={contractOptions}
          selectedItem={contractAddress}
          onOptionsChange={(options) => setContractOptions(options)}
          onSelectChange={handleContractChange}
          title="Contract"
          buttonText="add contract"
          disabled={isGettingContractRef.current}
        />
        <ReadWriteContract
          readMethods={readMethods}
          writeMethods={writeMethods}
          contract={contract}
          wallet={wallet}
          disabled={isGettingContractRef.current}
        />
      </div>
    </main>
  );
}

export default App;
