import React from 'react'
import Employeelayout from '../layout/Employeelayout';
import Dashboard from '../shared/Dashboard';
import useSWR from "swr"
import {fetchData} from "../../modules/modules"


const EmployeeDashboard = () => {
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
    <Employeelayout>
      <Dashboard data={trData && trData}/>
      
         </Employeelayout>
  )
}

export default EmployeeDashboard;