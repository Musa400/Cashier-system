import React from 'react'
import EmployeeLayout from "../../layout/Employeelayout"
import NewTransaction from '../../shared/NewTransaction'
import TransactionTable from '../../shared/TransactionTable'
const EmpTransaction = () => {
  //get userInfo from the session stroage
    const userInfo = JSON.parse(sessionStorage.getItem("userInfo"))
  return (
    <EmployeeLayout>
        <NewTransaction/>
        <TransactionTable query={{branch:userInfo?.branch}}/>
        

    </EmployeeLayout>
  )
}

export default EmpTransaction