  import Adminlayout from "../../layout/Adminlayout"
import NewTransaction from "../../shared/NewTransaction"
import TransactionTable from "../../shared/TransactionTable"

const AdminTransaction = ()=>{
     //get userInfo from the session stroage
    const userInfo = JSON.parse(sessionStorage.getItem("userInfo"))
    return(
        <Adminlayout>
            <NewTransaction/>
                   <TransactionTable query={{branch:userInfo?.branch}}/>
        </Adminlayout>
    )
}

export default AdminTransaction