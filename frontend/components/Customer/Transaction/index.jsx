import CustomerLayout from "../../layout/Customerlayout"
import TransactionTable from "../../shared/TransactionTable";
const CustomerTransaction = () => {
    //get userInfo from the session stroage
    const userInfo = JSON.parse(sessionStorage.getItem("userInfo"))

    return (
        <CustomerLayout>
            <TransactionTable query={{ accountNo: userInfo?.accountNo,
                branch: userInfo?.branch
            }} />
        </CustomerLayout>
    )
}

export default CustomerTransaction;