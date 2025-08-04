import React from 'react'
import Dashboard from '../shared/Dashboard';
import Adminlayout from '../layout/Adminlayout'
import useSWR from "swr"
import {fetchData} from "../../modules/modules"

const AdminDashboard = () => {
  //get UserInfo from sessionStorage
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
  const {data: trData, error:trError} = useSWR(
    `/api/transaction/summary?branch=${userInfo.branch}`,
    fetchData,
    {
      revalidateOnFocus:false,
      revalidateOnReconnect:false,
      refreshInterval: 1200000,
    }
  );

  return (
    <Adminlayout>
      <Dashboard data={trData && trData}/>
    </Adminlayout>
  )
}

export default AdminDashboard;