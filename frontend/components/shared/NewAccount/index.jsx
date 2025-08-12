import React, { useEffect, useState } from 'react'
import { Button, Card, Form, Image, Input, message, Modal, Popconfirm, Select, Table } from 'antd'
import { AccountBookOutlined, DeleteOutlined, DownloadOutlined, EditOutlined, EyeInvisibleOutlined, EyeOutlined, PrinterOutlined, SearchOutlined } from '@ant-design/icons'
import { http, uploadFile, fetchData, trimData } from '../../../modules/modules'
import dayjs from 'dayjs'
import useSWR, { mutate } from 'swr'
const { Item } = Form
const { Option } = Select

const ACCOUNT_TYPES = ['Bank', 'Person',"Earn","Expense"];

const NewAccount = () => {
    // get userInfo from the session storage
    const userInfo = JSON.parse(sessionStorage.getItem("userInfo"))
    const [accountForm] = Form.useForm();
    const [accountModal, setAccountModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [signature, setsignature] = useState(null);
    const [document, setDocument] = useState(null);
    const [no, setNo] = useState(0);
    const [messageApi, context] = message.useMessage();
    const [allCustomer, setAllCustomer] = useState(null)
    const [finalCustomer, setFinalCustomer] = useState(null)
    const [edit, setEdit] = useState(null);

    // transaction history Modal states
      const [transactionHistoryModal, setTransactionHistoryModal] = useState(false)
  const [transactionData, setTransactionData] = useState([])
  const [transactionLoading, setTransactionLoading] = useState(false)

  const [exchangeData, setExchangeData] = useState([])
  const [exchangeLoading, setExchangeLoading] = useState(false)

  const [selectedCustomerName, setSelectedCustomerName] = useState("")
  const [selectedCustomerId, setSelectedCustomerId] = useState(null)
  const [showingExchange, setShowingExchange] = useState(false)


    // get branding details
    const { data: brandings, error: bError } = useSWR(
        "/api/branding",
        fetchData,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            refreshInterval: 120000,
        }
    )

    let bankAccountNo = Number(brandings && brandings?.data[0]?.bankAccountNo) + 1
    let brandingId = brandings && brandings?.data[0]?._id;

    // Set accountNo field dynamically only if not editing
    useEffect(() => {
        if (!edit) {
            accountForm.setFieldValue("accountNo", bankAccountNo);
        }
    }, [bankAccountNo, edit, accountForm]);

    // get customer data
    useEffect(() => {
        const fetcher = async () => {
            try {
                const httpReq = http();
                const { data } = await httpReq.get("/api/customers");
                // Filter by user branch
              let filtered;

if (userInfo.userType === "admin") {
  // Admin sees all data
  filtered = data?.data;
} else {
  // Employee sees only their branch data
  filtered = data?.data?.filter((item) => item.branch === userInfo.branch);
}
                setAllCustomer(filtered);
                setFinalCustomer(filtered);
            } catch (err) {
                messageApi.error("Unable to fetch data !");
            }
        }
        fetcher();
    }, [no])

    // create new account 
    const onFinish = async (values) => {
        try {
            setLoading(true);
            const finalObj = trimData(values);

            // Build balances array from selected currencies with zero initial balance
            if (values.currencies && values.currencies.length > 0) {
                finalObj.balances = values.currencies.map(cur => ({
                    currency: cur,
                    balance: 0
                }));
            } else {
                finalObj.balances = [];
            }
            delete finalObj.currency; // remove old single currency field if any

            finalObj.profile = photo ? photo : "bankImages/dummy.png";
            finalObj.signature = signature ? signature : "bankImages/signature.png";
            finalObj.document = document ? document : "bankImages/bank.jfif";
            finalObj.key = finalObj.email;
            finalObj.userType = "customer";
            finalObj.branch = userInfo?.branch;
            finalObj.createdBy = userInfo?.email;

            const httpReq = http();
            const { data } = await httpReq.post(`/api/users`, finalObj)
            finalObj.customerLoginId = data?.data?._id

            const obj = {
                email: finalObj.email,
                password: finalObj.password
            }
            await httpReq.post(`/api/customers`, finalObj)
            await httpReq.post(`/api/send-email`, obj)
            await httpReq.put(`/api/branding/${brandingId}`, { bankAccountNo })

            accountForm.resetFields();
            mutate("/api/branding")
            setPhoto(null);
            setsignature(null);
            setDocument(null);
            setNo(no + 1)
            setAccountModal(false)
            messageApi.success("Account created ");
        } catch (err) {
            if (err?.response?.status === 409) {
                accountForm.setFields([
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

    // handle photo upload
    const handlePhoto = async (e) => {
        const file = e.target.files[0];
        const folderName = "customerPhoto"
        try {
            const result = await uploadFile(file, folderName);
            setPhoto(result.filePath)
        } catch (err) {
            messageApi.error("Unable to upload !");
        }
    }
    // handle signature upload
    const handleSignature = async (e) => {
        const file = e.target.files[0];
        const folderName = "customerSignature"
        try {
            const result = await uploadFile(file, folderName);
            setsignature(result.filePath)
        } catch (err) {
            messageApi.error("Unable to upload !");
        }
    }
    // handle document upload
    const handleDocument = async (e) => {
        const file = e.target.files[0];
        const folderName = "customerDocument"
        try {
            const result = await uploadFile(file, folderName);
            setDocument(result.filePath)
        } catch (err) {
            messageApi.error("Unable to upload !");
        }
    }

    // update isActive status
    const updateIsActive = async (id, isActive, loginId) => {
        try {
            const obj = {
                isActive: !isActive
            }
            const httpReq = http();
            await httpReq.put(`/api/users/${loginId}`, obj);
            await httpReq.put(`/api/customers/${id}`, obj);
            messageApi.success("Record updated successfully !")
            setNo(no + 1)
        } catch (err) {
            messageApi.error("Unable to update isActive !")
        }
    }

    // searching code 
    const onSearch = (e) => {
        const value = e.target.value.trim().toLowerCase();
        if (!value) {
            setAllCustomer(finalCustomer);
            return;
        }
        const filter = finalCustomer && finalCustomer.filter(cust => {
            if (cust?.fullname.toLowerCase().includes(value)) return true;
            if (cust?.userType.toLowerCase().includes(value)) return true;
            if (cust?.email.toLowerCase().includes(value)) return true;
            if (cust?.address.toLowerCase().includes(value)) return true;
            if (cust?.accountNo.toString().includes(value)) return true;
            if (cust?.createdBy.toLowerCase().includes(value)) return true;
            if (cust?.branch.toLowerCase().includes(value)) return true;
            if (cust?.mobile.toString().includes(value)) return true;

            // Check balances for currency or balance string match
            if (cust?.balances && cust.balances.some(b => 
                b.currency.toLowerCase().includes(value) ||
                b.balance.toString().includes(value)
            )) return true;

            return false;
        })
        setAllCustomer(filter)
    }

    // update customer data for edit
    const onEditUser = async (obj) => {
        setEdit(obj)
        setAccountModal(true)

        // Map balances array to currencies array for form initial value
        const initialCurrencies = obj.balances ? obj.balances.map(b => b.currency) : [];

        accountForm.setFieldsValue({ ...obj, currencies: initialCurrencies });
    }

    const onUpdate = async (values) => {
        try {
            setLoading(true)
            let finalObj = trimData(values);
            delete finalObj.password
            delete finalObj.email
            delete finalObj.accountNo

            // If photo/signature/document updated
            if (photo) finalObj.profile = photo;
            if (signature) finalObj.signature = signature;
            if (document) finalObj.document = document;

            // Update balances on edit if needed - here, keep old balances or update if currencies changed?
            // (You may want to add logic to sync balances with selected currencies)
            if (values.currencies && values.currencies.length > 0) {
                // Example: preserve existing balances if currency exists, else start at zero
                const existingBalances = edit.balances || [];
                finalObj.balances = values.currencies.map(cur => {
                    const existing = existingBalances.find(b => b.currency === cur);
                    return existing || { currency: cur, balance: 0 };
                });
            }

            const httpReq = http();
            await httpReq.put(`/api/customers/${edit._id}`, finalObj);
            messageApi.success("Customer Updated Successfully!")

            setNo(no + 1)
            setEdit(null);
            setPhoto(null);
            setsignature(null);
            setDocument(null);
            accountForm.resetFields()
            setAccountModal(false)
        } catch (err) {
            messageApi.error("Unable to update Customer !")
        } finally {
            setLoading(false)
        }
    }

    // delete customer
    const onDeleteUser = async (id, loginId) => {
        try {
            const httpReq = http();
            await httpReq.delete(`/api/users/${loginId}`)
            await httpReq.delete(`/api/customers/${id}`)

            messageApi.success("Customer Is Deleted Successfully !");
            setNo(no + 1)
        } catch (err) {
            messageApi.error("Unable To Delete The Customer !");
        }
    }

    // Fetch and format currency options
    const [currencyOptions, setCurrencyOptions] = useState([]);
    const [loadingCurrencies, setLoadingCurrencies] = useState(false);

    useEffect(() => {
        const fetchCurrencies = async () => {
            try {
                setLoadingCurrencies(true);
                const httpReq = http();
                const { data } = await httpReq.get("/api/currency");
                
                // Map the currencies to the required format for the Select component
                const formattedOptions = data.data.map(currency => ({
                    label: `${getCurrencySymbol(currency.currencyName)} ${currency.currencyName.toUpperCase()}  ${currency.currencyDesc}`,
                    value: currency.currencyName.toLowerCase()
                }));
                
                setCurrencyOptions(formattedOptions);
            } catch (error) {
                console.error("Error fetching currencies:", error);
                messageApi.error("Failed to load currencies");
            } finally {
                setLoadingCurrencies(false);
            }
        };

        fetchCurrencies();
    }, []);

    // Helper function to get currency symbol
    const getCurrencySymbol = (currencyCode) => {
        const symbols = {
            usd: '💵',
            eur: '💶',
            gbp: '💷',
            jpy: '💴',
            cny: '¥',
            inr: '₹',
            afn: '؋',
            pkr: '₨',
            sar: '﷼',
            aed: 'د.إ',
            cad: 'C$',
            aud: 'A$',
            chf: 'CHF',
            try: '₺',
            rub: '₽',
            brl: 'R$',
            mxn: 'Mex$',
            ngn: '₦',
            zar: 'R',
            krw: '₩',
            hkd: 'HK$',
            myr: 'RM',
            sgd: 'S$',
            thb: '฿',
            egp: 'E£',
            ils: '₪',
            kwd: 'KD',
            qar: 'QR',
            omr: 'OMR',
            mkd: 'ден'
        };
        return symbols[currencyCode.toLowerCase()] || '';
    };

    // Get all unique currencies from all accounts
    const getAllCurrencies = () => {
        const currencyMap = new Map();
        
        allCustomer?.forEach(customer => {
            customer.balances?.forEach(balance => {
                if (balance?.currency) {
                    // Normalize the currency code (trim, lowercase, and handle special cases)
                    let code = balance.currency.toString().trim().toLowerCase();
                    
                    // Handle common variations
                    if (code === '$' || code === 'usd' || code === 'dollar') code = 'usd';
                    else if (code === '؋' || code === 'afn' || code === 'afghani') code = 'afn';
                    else if (code === '₹' || code === 'inr' || code === 'rupee') code = 'inr';
                    // Add more variations as needed
                    
                    // Only add if we don't already have this currency
                    if (!currencyMap.has(code)) {
                        const config = currencyConfig[code] || { 
                            symbol: code.toUpperCase(), 
                            name: code.toUpperCase() 
                        };
                        currencyMap.set(code, config);
                    }
                }
            });
        });
        
        // Convert to array of [code, config] and sort by currency code
        return Array.from(currencyMap.entries())
            .sort(([codeA], [codeB]) => codeA.localeCompare(codeB));
    };

    // Generate dynamic currency columns
    const getCurrencyColumns = () => {
        const currencyEntries = getAllCurrencies();
        
        return currencyEntries.map(([code, config]) => ({
            title: config.name,
            key: `${code}_balance`,
            width: 120,
            align: 'right',
            render: (_, record) => {
                // Find the matching balance (case-insensitive and handle variations)
                const balance = record.balances?.find(b => {
                    if (!b.currency) return false;
                    const bCode = b.currency.toString().trim().toLowerCase();
                    
                    // Apply same normalization as in getAllCurrencies
                    if (bCode === '$' || bCode === 'usd' || bCode === 'dollar') return code === 'usd';
                    if (bCode === '؋' || bCode === 'afn' || bCode === 'afghani') return code === 'afn';
                    if (bCode === '₹' || bCode === 'inr' || bCode === 'rupee') return code === 'inr';
                    // Add more variations as needed
                    
                    return bCode === code;
                })?.balance || 0;
                
                const isNegative = Number(balance) < 0;
                const displayValue = Math.abs(Number(balance)).toLocaleString(undefined, { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                });
                
                return (
                    <div className="text-right">
                        <div className={`font-semibold ${isNegative ? 'text-red-600' : 'text-gray-800'}`}>
                            {config.symbol} {displayValue}
                        </div>
                    </div>
                );
            }
        }));
    };

    // Currency configuration
    const currencyConfig = {
        afn: { symbol: '؋', name: 'Afghani' },
        usd: { symbol: '$', name: 'Dollar' },
        eur: { symbol: '€', name: 'Euro' },
        inr: { symbol: '₹', name: 'Rupee' },
        gbp: { symbol: '£', name: 'Pound' },
        jpy: { symbol: '¥', name: 'Yen' },
        cny: { symbol: '¥', name: 'Yuan' },
        rub: { symbol: '₽', name: 'Ruble' },
        try: { symbol: '₺', name: 'Lira' },
        aed: { symbol: 'د.إ', name: 'Dirham' },
        sar: { symbol: '﷼', name: 'Riyal' },
        pkr: { symbol: '₨', name: 'Rupee' },
        egp: { symbol: 'E£', name: 'Pound' },
        kwd: { symbol: 'KD', name: 'Dinar' },
        qar: { symbol: 'QR', name: 'Riyal' },
        omr: { symbol: 'OMR', name: 'Rial' },
        cad: { symbol: 'C$', name: 'Canadian Dollar' },
        aud: { symbol: 'A$', name: 'Australian Dollar' },
        chf: { symbol: 'CHF', name: 'Franc' },
        hkd: { symbol: 'HK$', name: 'Hong Kong Dollar' },
        sgd: { symbol: 'S$', name: 'Singapore Dollar' },
        thb: { symbol: '฿', name: 'Baht' },
        krw: { symbol: '₩', name: 'Won' },
        myr: { symbol: 'RM', name: 'Ringgit' },
        ngn: { symbol: '₦', name: 'Naira' },
        zar: { symbol: 'R', name: 'Rand' },
        brl: { symbol: 'R$', name: 'Real' },
        mxn: { symbol: 'Mex$', name: 'Peso' },
        ils: { symbol: '₪', name: 'Shekel' },
        nok: { symbol: 'kr', name: 'Krone' },
        sek: { symbol: 'kr', name: 'Krona' },
        dkk: { symbol: 'kr', name: 'Krone' },
        php: { symbol: '₱', name: 'Peso' },
        idr: { symbol: 'Rp', name: 'Rupiah' },
        lkr: { symbol: 'Rs', name: 'Rupee' },
        bdt: { symbol: '৳', name: 'Taka' },
        mkd: { symbol: 'ден', name: 'Denar' }
    };

    // Table columns definition
    const columns = [
        {
            title: "Photo",
            key: "photo",
            render: (_, obj) => (
                <Image src={`${import.meta.env.VITE_BASEURL}/${obj?.profile}`} className="rounded-full" width={40} height={40} />
            )
        },
        {
            title: "Signature",
            key: "signature",
            render: (_, obj) => (
                <Image src={`${import.meta.env.VITE_BASEURL}/${obj?.signature}`} className="rounded-full" width={40} height={40} />
            )
        },
        {
            title: "Document",
            key: "document",
            render: (_, obj) => (
                <Button type='text' shape='circle' className='!bg-blue-100 !text-blue-500' icon={<DownloadOutlined />} />
            )
        },
        {
            title: "Created By",
            dataIndex: "createdBy",
            key: "createdBy",
        },
        {
            title: "Address",
            dataIndex: "address",
            key: "address",
        },
        {
            title: "Branch",
            dataIndex: "branch",
            key: "branch",
        },
        {
            title: "User Type",
            dataIndex: "userType",
            key: "userType",
            render: (text) => {
                if (text === "admin") {
                    return <span className='capitalize text-indigo-500'>{text}</span>
                } else if (text === "employee") {
                    return <span className='capitalize text-green-500'>{text}</span>
                } else {
                    return <span className='capitalize text-red-500'>{text}</span>
                }
            }
        },
        {
            title: "Account No",
            dataIndex: "accountNo",
            key: "accountNo",
        },
        // Add dynamic currency columns
        ...getCurrencyColumns(),
        {
            title: "Fullname",
            dataIndex: "fullname",
            key: "fullname",
        },
        {
            title: "DOB",
            dataIndex: "dob",
            key: "dob",
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
            title: "Action",
            key: "action",
            fixed: "left",
            render: (_, obj) => (
                <div className="flex gap-1">
                    <Popconfirm
                        title="Are you sure ?"
                        description="Once you update, you can also re-update !"
                        onCancel={() => messageApi.info("No changes occur !")}
                        onConfirm={() => updateIsActive(obj._id, obj.isActive, obj.customerLoginId)}
                    >
                        <Button type='text' className={`${obj.isActive ? "!bg-indigo-100 !text-indigo-500" : "!bg-pink-100 !text-pink-500"}`} icon={obj.isActive ? <EyeOutlined /> : <EyeInvisibleOutlined />} />
                    </Popconfirm>
                    <Popconfirm
                        title="Are You Sure !"
                        description="Once you update,you can also re-update !"
                        onCancel={() => messageApi.info("No Changes occur !")}
                        onConfirm={() => onEditUser(obj)}
                    >
                        <Button type='text' className='!bg-green-100 !text-green-500' icon={<EditOutlined />} />
                    </Popconfirm>
                    <Popconfirm
                        title="Are You Sure ?"
                        description="Once You Deleted, you can not re-store !"
                        onCancel={() => messageApi.info("Your data is safe !")}
                        onConfirm={() => onDeleteUser(obj._id, obj.customerLoginId)}
                    >
                        <Button type='text' className='!bg-rose-100 !text-rose-500' icon={<DeleteOutlined />} />
                    </Popconfirm>
                    <Button 
                    type ='text'
                    className='!bg-blue-100 !text-yellow-500'
                    icon={<AccountBookOutlined />}
                    onClick={() => openTransactionHistory(obj)}
                    />
                </div>
            )
        },
    ];

    const onCloseModal = () => {
        accountForm.resetFields();
        setAccountModal(false)
        setEdit(null)
        setPhoto(null);
        setsignature(null);
        setDocument(null);
    }

    //fetch the transaction history for a customer
   const openTransactionHistory = async (customer) => {
    setSelectedCustomerName(`${customer.fullname} (${customer.accountNo})`)
    setSelectedCustomerId(customer._id)
    setTransactionHistoryModal(true)
    setShowingExchange(false) // start with Transaction history

    // fetch transaction history
    setTransactionLoading(true)
    try {
      const httpReq = http()
      const transRes = await httpReq.get(`/api/transaction/history/${customer._id}`)
      setTransactionData(transRes.data.data || [])
    } catch {
      messageApi.error("راکړه ورکړه تاریخچه راټولول ممکن نه و!")
      setTransactionData([])
    } finally {
      setTransactionLoading(false)
    }

    // fetch exchange history
    setExchangeLoading(true)
    try {
      const httpReq = http()
      const exchRes = await httpReq.get(`/api/exchange/historys/${customer._id}`)
      setExchangeData(exchRes.data.data || [])
    } catch {
      messageApi.error("د تبادلې تاریخچه راټولول ممکن نه و!")
      setExchangeData([])
    } finally {
      setExchangeLoading(false)
    }
  }

    return (
        <div>
            {context}
            <div className='grid'>
                <Card
                    title="Account List"
                    style={{ overflowX: "auto" }}
                    extra={
                        <div className='flex gap-x-3'>
                            <Input placeholder='Search By All' prefix={<SearchOutlined />} onChange={onSearch} />
                            <Button onClick={() => setAccountModal(true)} type='text' className='!font-bold !bg-blue-500 !text-white'>Add New Account</Button>
                        </div>
                    }
                >
                    <Table columns={columns} dataSource={allCustomer} scroll={{ x: "max-content" }} />
                </Card>
            </div>

            <Modal footer={null} title={edit ? "Update Account" : "Open New Account"} open={accountModal} onCancel={onCloseModal} width={820}>
                <Form layout='vertical' onFinish={edit ? onUpdate : onFinish} form={accountForm}>
                    {
                        !edit &&
                        <div className='grid md:grid-cols-3 gap-x-3'>
                            <Item label="Account No" name="accountNo" rules={[{ required: true }]}>
                                <Input disabled placeholder='Account no' />
                            </Item>
                            <Item label="Email" name="email" rules={[{ required: edit ? true : false }]}>
                                <Input disabled={edit ? true : false} placeholder='Enter Email' />
                            </Item>
                            <Item label="Password" name="password" rules={[{ required: edit ? false : true }]}>
                                <Input.Password placeholder='Password' disabled={edit ? true : false} />
                            </Item>
                        </div>
                    }
                    <div className="grid md:grid-cols-3 gap-x-3">
                    <Item
                            label="Account Type"
                            name="accountType"
                            rules={[{ required: true, message: 'Please select account type' }]}
                        >
                            <Select placeholder="Select account type">
                                {ACCOUNT_TYPES.map(t => (
                                    <Option key={t} value={t.toLowerCase()}>
                                        {t}
                                    </Option>
                                ))}
                            </Select>
                        </Item>
                        <Item label="FullName" name="fullname" rules={[{ required: true }]}>
                            <Input placeholder='Full name' />
                        </Item>
                        <Item label="Mobile" name="mobile" rules={[{ required: true }]}>
                            <Input placeholder='Mobile Number' />
                        </Item>
                        <Item label="Father Name" name="fatherName" rules={[{ required: true }]}>
                            <Input placeholder='Father name' />
                        </Item>
                        <Item label="DOB" name="dob" rules={[{ required: true }]}>
                            <Input type='date' />
                        </Item>
                        <Item label="Gender" name="gender" rules={[{ required: true }]}>
                            <Select placeholder="Select The Gender">
                                <Option value="male">Male</Option>
                                <Option value="female">Female</Option>
                            </Select>
                        </Item>
                        
                        <Item label="Currencies" name="currencies" rules={[{ required: true }]}>
                            <Select
                                mode="multiple"
                                placeholder="Select The Currencies"
                                loading={loadingCurrencies}
                                options={currencyOptions}
                                optionFilterProp="label"
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                            />
                        </Item>
                        <Item label="Photo" name="xyz" >
                            <Input type='file' onChange={handlePhoto} />
                        </Item>
                        <Item label="Signature" name="dfrf" >
                            <Input type='file' onChange={handleSignature} />
                        </Item>
                        <Item label="Document" name="nus" >
                            <Input type='file' onChange={handleDocument} />
                        </Item>
                    </div>
                    <Item label="Address" name="address" rules={[{ required: true }]}>
                        <Input.TextArea />
                    </Item>
                    <Item className='flex justify-end items-center'>
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
            </Modal>

            
      {/* Transaction & Exchange History Modal */}
      <Modal
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              direction: "rtl",
              gap: "10px"
            }}
          >
            <span style={{ fontWeight: "bold" }}>
              {showingExchange ? "د تبادلې تاریخچه لپاره " : "د راکړې ورکړې تاریخچه لپاره "} {selectedCustomerName}
            </span>
            <Button
              type="primary"
              size="small"
              onClick={() => setShowingExchange(!showingExchange)}
            >
              {showingExchange ? "Transaction" : "Exchange"}
            </Button>
            <Button icon={<PrinterOutlined />} style={{ direction: "ltr" }} />
          </div>
        }
        open={transactionHistoryModal}
        onCancel={() => {
          setTransactionHistoryModal(false)
          setShowingExchange(false)
        }}
        footer={[
          <Button key="close" onClick={() => {
            setTransactionHistoryModal(false)
            setShowingExchange(false)
          }}>
            بندول
          </Button>
        ]}
        width={700}
      >
        <div id="printArea">
          {showingExchange ? (
            <Table
              loading={exchangeLoading}
              dataSource={exchangeData}
              rowKey="_id"
              pagination={{ pageSize: 5 }}
              columns={[
                { title: "له کومې اسعار", dataIndex: "fromCurrency", key: "fromCurrency" },
                { title: "څخه کومې اسعار", dataIndex: "toCurrency", key: "toCurrency" },
                { title: "مقدار", dataIndex: "amount", key: "amount" },
                { title: "نرخ", dataIndex: "rate", key: "rate" },
                { title: "تبدیل شوی مقدار", dataIndex: "convertedAmount", key: "convertedAmount" },
                {
                  title: "نېټه",
                  dataIndex: "date",
                  key: "date",
                  render: (date) => dayjs(date).format("YYYY-MM-DD HH:mm"),
                },
              ]}
              size="small"
            />
          ) : (
            <Table
              loading={transactionLoading}
              dataSource={transactionData}
              rowKey="_id"
              pagination={{ pageSize: 5 }}
              columns={[
                {
                  title: "نېټه",
                  dataIndex: "createdAt",
                  key: "createdAt",
                  render: (date) => date ? dayjs(date).format("YYYY-MM-DD HH:mm:ss") : "N/A",
                },
                { title: "تفصیل", dataIndex: "reference", key: "reference" },
                { title: "Currency", dataIndex: "currency", key: "currency" },
                {
                  title: "مقدار",
                  dataIndex: "transactionAmount",
                  key: "transactionAmount",
                  render: (amount) => amount?.toLocaleString() || 0,
                },
                {
                  title: "ډول",
                  dataIndex: "transactionType",
                  key: "transactionType",
                  render: (type) => (type === "cr" ? "credit" : "debit"),
                },
              ]}
              size="small"
            />
          )}
        </div>
      </Modal>

        </div>
    );
}

export default NewAccount;
