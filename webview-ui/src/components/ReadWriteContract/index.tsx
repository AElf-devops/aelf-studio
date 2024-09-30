import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { IWalletInfo } from 'aelf-sdk/types/wallet';
import DynamicForm from '../DynamicForm';
import { IMethod } from '../../types';
import './index.css';

interface IReadWriteContractProps {
  readMethods: IMethod[];
  writeMethods: IMethod[];
  contract: any;
  wallet?: IWalletInfo;
  disabled: boolean;
}

enum ItemKey {
  READ_CONTRACT = 'readContract',
  WRITE_CONTRACT = 'writeContract',
}

export default function ReadWriteContract({
  readMethods,
  writeMethods,
  contract,
  wallet,
  disabled,
}: IReadWriteContractProps) {
  const [activeKey, setActiveKey] = useState(ItemKey.READ_CONTRACT);

  const tabChange = (key: ItemKey) => {
    setActiveKey(key);
  };

  const items = useMemo(() => {
    return [
      {
        key: ItemKey.READ_CONTRACT,
        label: 'Read Contract',
        children: (
          <DynamicForm
            methods={readMethods}
            contract={contract}
            wallet={wallet}
            disabled={disabled}
          />
        ),
      },
      {
        key: ItemKey.WRITE_CONTRACT,
        label: 'Write Contract',
        children: (
          <DynamicForm
            methods={writeMethods}
            contract={contract}
            wallet={wallet}
            disabled={disabled}
          />
        ),
      },
    ];
  }, [contract, readMethods, writeMethods, wallet, disabled]);

  return (
    <div className="contract-container">
      <div className="pb-5">
        <ul className="contract-button-container flex gap-[9px]">
          {items.map((item) => {
            return (
              <li
                key={item.key}
                className="contract-button"
                onClick={() => tabChange(item.key)}
              >
                <a
                  className={clsx(
                    'contract-button-link',
                    activeKey === item.key && 'active-button-link',
                  )}
                  href="javascript:;"
                >
                  <span>{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="contract-pane-container">
        {items.map((item) => {
          return (
            <div
              className={clsx(
                'contract-pane',
                activeKey === item.key ? 'block' : 'hidden',
              )}
              key={item.key}
            >
              {item.children}
            </div>
          );
        })}
      </div>
    </div>
  );
}
