import React, { useEffect, useState } from 'react'
import Adminlayout from '../../layout/Adminlayout';
import { Button, Card, Form, Image, Input, message, Popconfirm, Select, Table } from 'antd';
import { DeleteOutlined, EditOutlined, EyeInvisibleOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { trimData, http,fetchData,uploadFile } from '../../../modules/modules';
import useSWR from "swr" 


import swal from 'sweetalert';
const { Item } = Form


const NewEmployee = () => {
  //state collection
  const [empform] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [allEmployee, setAllEmployee] = useState([]);
  const [finalEmployee, setFinalEmployee] = useState([]);
  const [allBranch, setAllBranch] = useState([]);
  const [edit, setEdit] = useState(null);
  const [no, setNo] = useState(0);
  const [messageApi, context] = message.useMessage();
 

  // get branch data
   const {data:branches,error:bError} = useSWR(
    "/api/branch",
    fetchData,
    {
      revalidateOnFocus : false,
      revalidateOnReconnect : false,
      refreshInterval : 1200000
    }

   )

  useEffect (()=>{
    if(branches){
      let filter = branches && branches?.data.map(item=>(
        {
          label: item.branchName,
          value : item.branchName,
          key : item.key
        }
      ));
      setAllBranch(filter)
    }

  },[branches])

  //get all employees

  useEffect(() => {
    const fetcher = async () => {
      try {
        const httpReq = http();
        const { data } = await httpReq.get("/api/users");
        setAllEmployee(data?.data.filter((item)=>item.userType != "customer"));
        setFinalEmployee(
          data.data
        );
      } catch (err) {
        messageApi.error("Unable to fetch data !");
      }
    }
    fetcher();


  }, [no])

  //create a new employee

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const finalObj = trimData(values)
      finalObj.profile = photo ? photo : "public/bankImages/dummy.png";
      finalObj.key = finalObj.email
      finalObj.userType = "employee"
      const httpReq = http();
      const { data } = await httpReq.post(`/api/users`, finalObj)

      const obj = {
        email: finalObj.email,
        password: finalObj.password
      }

      const res = await httpReq.post(`/api/send-email`, obj)
      

      messageApi.success("Employee created ");
      empform.resetFields();
      setPhoto(null);
      setNo(no + 1)
    } catch (err) {
      if (err?.response?.status === 409) {
        empform.setFields([
          {
            name: 'email',
            errors: ["Email already exist !"],
          }
        ])

      } else {
        messageApi.error("please try again !");
      }

    } finally {
      setLoading(false);
    }

  }


  //update is active
  const updateIsActive = async (id, isActive) => {
    try {
      const obj = {
        isActive: !isActive
      }
      const httpReq = http();
      await httpReq.put(`/api/users/${id}`, obj);
      messageApi.success("Record updated successfully !")
      setNo(no + 1)

    } catch (err) {
      messageApi.error("Unable to update isActive !")

    }

  }

  //update employee
  const onEditUser = async (obj) => {
    setEdit(obj)
    empform.setFieldsValue(obj)
  }


  const onUpdate = async (values) => {
    try {
      setLoading(true)
      let finalObj = trimData(values);
      
      if (photo) {
        finalObj.profile = photo
      }
      const httpReq = http();
      await httpReq.put(`/api/users/${edit._id}`, finalObj);
      messageApi.success("Employee Update Successfully!")
      setNo(no + 1)
      setEdit(null);
      empform.resetFields()



    } catch (err) {
      messageApi.error("Unable to update employee !")

    } finally {
      setLoading(false)
    }


  }

  //delete employee
  const onDeleteUser = async (id) => {
    try {
      const httpReq = http();
      await httpReq.delete(`/api/users/${id}`)
      messageApi.success("User Is Deleted Successfully !");
      setNo(no + 1)
    } catch (err) {
      messageApi.error("Unable To Delete The User !");

    }
  }


  //handle upload
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const folderName = "employeePhoto"
    try {
      const result = await uploadFile(file,folderName);
      setPhoto(result.filePath)
    } catch (err) {
      messageApi.error("Unable to upload !");

    }

  }

  // searching coding 
  const onSearch = (e)=>{
    const value = e.target.value.trim().toLowerCase();
    const filter = finalEmployee && finalEmployee.filter(emp=>{
      if(emp?.fullname.toLowerCase().indexOf(value) != -1){
        return emp 
      }
      else if(emp?.userType.toLowerCase().indexOf(value) != -1){
        return emp 
      }
      else if(emp?.email.toLowerCase().indexOf(value) != -1){
        return emp 
      }
      else if(emp?.address.toLowerCase().indexOf(value) != -1){
        return emp 
      }
      else if(emp?.branch.toLowerCase().indexOf(value) != -1){
        return emp 
      }
      else if(emp?.mobile.toString().indexOf(value) != -1){
        return emp 
      }
      
    })
    setAllEmployee(filter)
  }




  //columns for the table
  const columns = [
    {
      title: "Profile",
      key: "profile",
      render: (src, obj) => (
        <Image src={`${import.meta.env.VITE_BASEURL}/${obj.profile}`} className="rounded-full" width={40} height={40} />
      )
    },
    {
      title: "User Type",
      dataIndex: "userType",
      key: "userType",
      render : (text)=>{
        if(text === "admin"){
          return <span className=' capitalize text-indigo-500'>{text}</span>
        }
        else if(text === "employee"){
          return <span className=' capitalize text-green-500'>{text}</span>
        }
        else{
          return <span className=' capitalize text-red-500'>{text}</span>
        }
      }
    },
    {
      title: "Branch",
      dataIndex: "branch",
      key: "branch",
    },
    {
      title: "Fullname",
      dataIndex: "fullname",
      key: "fullname",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",

    },
    {
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",

    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_, obj) => (
        <div className="flex gap-1  ">
          <Popconfirm
            title="Are you sure ?"
            description="Once you update, you can also re-update !"
            onCancel={() => messageApi.info("No changes occur !")}
            onConfirm={() => updateIsActive(obj._id, obj.isActive)}
          >

            <Button type='text' className={`${obj.isActive ? "!bg-indigo-100 !text-indigo-500" : "!bg-pink-100 !text-pink-500"}`} icon={obj.isActive ? <EyeOutlined /> : <EyeInvisibleOutlined />}></Button>

          </Popconfirm>


          <Popconfirm title="Are You Sure !"
            description="Once you update,you can also re-update !"
            onCancel={() => messageApi.info("No Changes occur !")}
            onConfirm={() => onEditUser(obj)}

          >

            <Button type='text' className='!bg-green-100 !text-green-500' icon={<EditOutlined />}></Button>

          </Popconfirm>


          <Popconfirm
            title="Are You Sure ?"
            description="Once You Deleted, you can not re-store !"
            onCancel={() => messageApi.info("Your data is safe !")}
            onConfirm={() => onDeleteUser(obj._id)}

          >

            <Button type='text' className='!bg-rose-100 !text-rose-500' icon={<DeleteOutlined />}></Button>
          </Popconfirm>

        </div>
      )

    },
  ]
  return (
    <Adminlayout>
      {context}
      <div className='grid md:grid-cols-3 gap-3'>
        <Card
          title="Add new employee"
        >
          <Form layout='vertical' form={empform} onFinish={edit ? onUpdate : onFinish} >
            <Item
              name="branch"
              label="Select Branch"
              
              rules={[{required:true}]}
            >
              <Select
              placeholder="Select Branch"
              options={ allBranch }
             
              />

            </Item>
            <Item label="Profile" name="xyz">
              <Input onChange={handleUpload} type='file' />
            </Item>
            <div className="grid md:grid-cols-2 gap-x-2">
              <Item name="fullname" label="Fullname" rules={[{ required: true }]}>
                <Input />
              </Item>
              <Item name="mobile" label="Mobile" rules={[{ required: true }]}>
                <Input type='number' />
              </Item>
              <Item name="email" label="Email" rules={[
                { required: edit ? true : false },
                {
                  pattern: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
                  message: 'Only Gmail addresses are allowed (e.g. user@gmail.com)',
                },
              ]}>
                <Input disabled={edit ? true : false} />
              </Item>
              <Item name="password" label="Password" rules={[{ required: true }]}>
                <Input.Password  />
              </Item>
            </div>
            <Item
              label="Address"
              name="address"
              rules={[{ required: true }]}

            >
              <Input.TextArea />
            </Item>
            <Item>
              {
                edit
                  ?
                  <Button
                    type='text'
                    htmlType='submit'
                    className='!bg-rose-500 !text-white !font-bold !w-full'
                    loading={loading}
                  >
                    Update
                  </Button>
                  :
                  <Button
                    type='text'
                    htmlType='submit'
                    className='!bg-blue-500 !text-white !font-bold !w-full'
                    loading={loading}
                  >
                    Submit
                  </Button>
              }
            </Item>

          </Form>


        </Card>
        <Card
          className='md:col-span-2'
          title="Employee list"
          style={{ overflowX: "auto" }}
          extra={
            <div>
              <Input placeholder='Search By All ' prefix={<SearchOutlined/>} onChange={onSearch}/>

            </div>

          }
        >
          <Table columns={columns} dataSource={allEmployee} scroll={{ x: "max-content" }} />
        </Card>

      </div>
    </Adminlayout>
  )
}


export default NewEmployee;


