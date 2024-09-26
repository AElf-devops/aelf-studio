import { Collapse, message } from 'antd';
import FormItem from './formItem';
import { IMethod } from '../../types';
import IconFont from '../IconFont';
import clsx from 'clsx';
import copy from 'copy-to-clipboard';
import EPTooltip from '../EPToolTip';
import { useEffect } from 'react';
import { getSecondHashValue } from '../../utilities';
import { IWalletInfo } from 'aelf-sdk/types/wallet';
import './index.css';

export default function DynamicForm({
  methods,
  contract,
  activeKey,
  wallet,
}: {
  methods: IMethod[];
  contract: any;
  activeKey: string;
  wallet?: IWalletInfo;
}) {
  const handleCopy = (value: string) => {
    message.destroy();
    try {
      copy(value);
      message.success('Copied Successfully');
    } catch {
      message.error('Copy failed, please copy by yourself.');
    }
  };

  useEffect(() => {
    const hash = getSecondHashValue(window.location.href);
    if (hash) {
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  return (
    <div className="contract-collapse-container pb-4">
      <div className="flex flex-col gap-4">
        {methods.map((item, index) => {
          return (
            <div key={item.name} id={item.name}>
              <Collapse
                collapsible="header"
                expandIconPosition="end"
                expandIcon={({ isActive }) => (
                  <IconFont
                    type="right-arrow-dfna6beo"
                    className={clsx(
                      'arrow text-xs',
                      isActive ? 'rotate-90' : 'rotate-0',
                    )}
                  />
                )}
                items={[
                  {
                    key: item.name,
                    label: (
                      <div className="w-full truncate pr-1">
                        {index + 1}.
                        <EPTooltip
                          mode="dark"
                          placement="top"
                          title={item.name}
                        >
                          <span>{item.name}</span>
                        </EPTooltip>
                      </div>
                    ),
                    extra: (
                      <div className="flex items-center gap-4">
                        <EPTooltip
                          mode="dark"
                          placement="top"
                          title="Copy Method Name"
                        >
                          <IconFont
                            type="view-copy"
                            onClick={() => {
                              handleCopy(item.name);
                            }}
                          />
                        </EPTooltip>
                        <EPTooltip
                          mode="dark"
                          placement="top"
                          title="Copy Permalink"
                        >
                          <IconFont
                            type="link"
                            onClick={() => {
                              handleCopy(
                                window.location.href +
                                  `&type=${activeKey}` +
                                  '#' +
                                  item.name,
                              );
                            }}
                          />
                        </EPTooltip>
                      </div>
                    ),
                    children: (
                      <FormItem
                        wallet={wallet}
                        contract={contract}
                        type={item.type}
                        name={item.name}
                        input={item.input}
                        fn={item.fn}
                      ></FormItem>
                    ),
                  },
                ]}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
