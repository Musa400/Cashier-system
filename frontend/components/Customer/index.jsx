import CustomerLayout from "../layout/Customerlayout"
import Dashboard from '../shared/Dashboard/index'
import useSWR from "swr"
import {fetchData} from "../../modules/modules"


    
const CustomerDashboard = ()=>{
    //get UserInfo from sessionStorage
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
  const {data: trData, error: trError} = useSWR(
    `/api/transaction/summary?accountNo=${userInfo.accountNo}`,
    fetchData,
    {
      revalidateOnFocus:false,
      revalidateOnReconnect:false,
      refreshInterval: 1200000,
    }

  );
  console.log(trData)
    return (
        <CustomerLayout>
            <Dashboard data={trData && trData}/>
        </CustomerLayout>
    )
}

export default CustomerDashboard;