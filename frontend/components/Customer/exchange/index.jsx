import CustomerLayout from "../../layout/Customerlayout"
import ExchangeTable from "../../shared/Exchange Table";
const customerExchange = () => {
  // 📝 Get userInfo from sessionStorage
    const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));

    return (
        <CustomerLayout>
          {/* Use _id for backend route */}
          <ExchangeTable  />
        </CustomerLayout>
    );
}

export default customerExchange;