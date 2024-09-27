// Every item made up with title, params input and query button.

import { Divider, Form } from 'antd';
import { Button, Input } from 'aelf-design';
import { useEffect, useState } from 'react';
import ReactJson from 'react-json-view';
import { IMethod } from '../../types';
import ValueFormItem from './valueFormItem';
import { IWalletInfo } from 'aelf-sdk/types/wallet';
import './index.css';

export default function FormItem({
  name,
  input,
  type,
  contract,
  wallet,
  disabled,
}: IMethod & {
  contract: any;
  wallet?: IWalletInfo;
  disabled: boolean;
}) {
  const [form] = Form.useForm();
  const [res, setRes] = useState<any>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [writeLoading, setWriteLoading] = useState<boolean>(false);

  const values = Form.useWatch([], form);
  const [submittable, setSubmittable] = useState<boolean>(false);

  useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then((values) => {
        const task = Object.values(values).every((item) => item || item === 0);
        if (task) {
          setSubmittable(true);
        } else {
          setSubmittable(false);
        }
      })
      .catch(() => setSubmittable(false));
  }, [form, values]);

  const query = async () => {
    setLoading(true);
    // get all fileds value with param true
    const filedsValue = form.getFieldsValue();
    try {
      const result =
        filedsValue && Object.keys(filedsValue).length
          ? await contract[name].call(filedsValue)
          : await contract[name].call();
      if (result) {
        setRes(result);
      } else {
        setRes({
          data: null,
        });
      }
    } catch (e: any) {
      setRes(e);
    } finally {
      setLoading(false);
    }
  };

  const write = async () => {
    setWriteLoading(true);
    const filedsValue = form.getFieldsValue();
    try {
      const res = await contract[name](filedsValue);
      setRes(res);
    } catch (e: any) {
      if (e instanceof Error) {
        const obj = {
          name: e.name,
          message: e.message,
          stack: e.stack,
        };
        setRes(obj);
      } else {
        setRes(e);
      }
    } finally {
      setWriteLoading(false);
    }
  };

  return (
    <>
      <Form form={form} layout="vertical" name={name} key={name}>
        {input?.map((ele) =>
          ele.type === 'int64' ? (
            <ValueFormItem
              form={form}
              type={ele.type}
              key={ele.name}
              data={ele}
              disabled={disabled}
            />
          ) : (
            <Form.Item key={ele.name} label={ele.name} name={ele.name}>
              <Input size="small" disabled={disabled} />
            </Form.Item>
          ),
        )}
        <Form.Item>
          <div className="flex w-full items-center">
            {type === 'read' && (
              <Button
                type="primary"
                size="small"
                className="mr-3 bg-link"
                disabled={disabled || (!submittable && !!input.length)}
                loading={loading}
                onClick={query}
              >
                Query
              </Button>
            )}
            {type === 'write' && (
              <Button
                size="small"
                className="bg-link"
                disabled={
                  disabled || !wallet || (!submittable && !!input.length)
                }
                loading={writeLoading}
                type="primary"
                onClick={write}
              >
                Write
              </Button>
            )}
          </div>
        </Form.Item>
      </Form>

      {res && (
        <>
          <Divider dashed />
          <div>Response Body</div>
          <div className="overflow-x-auto">
            <ReactJson src={res} />
          </div>
        </>
      )}
    </>
  );
}
