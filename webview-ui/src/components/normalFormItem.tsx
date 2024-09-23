import React,{ useState } from 'react';
import { Alert,Button,Input,Modal,} from 'aelf-design';
import { Select,Form } from 'antd';
import { rpcs } from '../common';


interface IProps {
    initialList: { value: string,text: 'string' }[];
    onSelectChange: (value: string) => void;
    title: string;
    buttonText: string;
}
export default function normalFormItem({ initialList,onSelectChange,title,buttonText }: IProps) {
    // header
    // select + button
    // select initail items [{key: value}]
    // button text、onclick -> openModal
    // modal: add address、name, title = header + text, click add button -> select list(validate is exist key)

    const [isModalOpen,setIsModalOpen] = useState(false);
    const handleCancel = () => {
        setIsModalOpen(false);
    };
    const [list,setList] = useState(initialList);
    const [item,setItem] = useState(list[0].value)
    const handleChange = (value: string) => {
        setItem(value);
        onSelectChange(value);
    };
    const onAdd = () => {
        setIsModalOpen(true);
    }

    const handleOk = () => {
        const values = form.getFieldsValue()
        const newRpcItem = {
            value: values.rpcUrl,
            text: values.rpcName || values.rpcUrl,
        }
        if (list.map(ele => ele.value).includes(newRpcItem.value)) {
            <Alert message="Already Exist" type="error" />
        } else {
            setList([...list,newRpcItem]);
            setIsModalOpen(false);
        }
    };

    const [form] = Form.useForm();
    return (<div>
        <h2 className='text-3xl'>{title}:</h2>
        <div className='flex w-full'>
            <Select options={list} className='mr-2 h-[48px]' defaultValue={item} onChange={handleChange}></Select>
            <Button onClick={onAdd}>{buttonText}</Button>
            <Modal open={isModalOpen} onOk={handleOk} onCancel={handleCancel} okText="Add">
                <Form
                    form={form}
                    name="basic"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 16 }}
                    initialValues={{ remember: true }}
                    autoComplete="off"
                >
                    <Form.Item
                        label={`${title}Address`}
                        name={`${title}Address`}
                        rules={[{ required: true,message: `Please input your ${title}!` }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label={`${title}Name`}
                        name={`${title}Name`}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    </div>)
}