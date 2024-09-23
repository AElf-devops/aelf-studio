import React,{ useState } from 'react';
import { Button,Input,Modal,} from 'aelf-design';
import { Select,Form } from 'antd';
import { rpcs } from '../common';
type FieldType = {
    rpcUrl?: string;
    rpcName?: string;
};
function RPCBlock() {
    const [isModalOpen,setIsModalOpen] = useState(false);


    const handleCancel = () => {
        setIsModalOpen(false);
    };
    const [rpcList,setRpcList] = useState(rpcs);
    const [rpc,setRpc] = useState(rpcList[0].value);
    const handleChange = (value: string) => {
        setRpc(value);
    };
    const addRpc = () => {
        setIsModalOpen(true);
    }

    const handleOk = () => {
        const values = form.getFieldsValue()
        const newRpcItem = {
            value: values.rpcUrl,
            text: values.rpcName || values.rpcUrl,
        }
        setRpcList([...rpcList,newRpcItem]);
        setIsModalOpen(false);
    };

    const [form] = Form.useForm();
    return (<div>
        <h2 className='text-3xl'>RPC:</h2>
        <div className='w-full flex'>
            <Select options={rpcList} className='mr-2 h-[48px]' defaultValue={rpc} onChange={handleChange}></Select>
            <Button onClick={addRpc}>add rpc</Button>
            <Modal open={isModalOpen} onOk={handleOk} onCancel={handleCancel} okText="Add">
                <Form
                    form={form}
                    name="basic"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 16 }}
                    initialValues={{ remember: true }}
                    autoComplete="off"
                >
                    <Form.Item<FieldType>
                        label="RPCUrl"
                        name="rpcUrl"
                        rules={[{ required: true,message: 'Please input your rpcUrl!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item<FieldType>
                        label="RPCName"
                        name="rpcName"
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    </div>)
}
export default RPCBlock;