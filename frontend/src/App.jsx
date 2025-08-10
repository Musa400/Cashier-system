import React from 'react'
import Guard from '../components/Gaurd'
import { lazy, Suspense } from 'react'
import Loader from '../components/Loader'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

const Homepage = lazy(()=>import("../components/Home"))
const Dashboard = lazy(()=>import("../components/Admin"))
const NewEmployee = lazy(()=>import("../components/Admin/NewEmployee"))
const Branding = lazy(()=>import("../components/Admin/Barnding"))
const Branch = lazy(()=>import("../components/Admin/Branch"))
const Currency = lazy(()=>import("../components/Admin/Currency"))
const EmployeeDashboard = lazy(()=>import("../components/Employee"))
const AdminNewAccount = lazy(()=>import('../components/Admin/AdminNewAccount'))
const EmpTransaction = lazy(()=>import('../components/Employee/EmpTransaction'))
const AdminExchange = lazy(()=>import('../components/Admin/Exchange'))
const EmpNewAccount = lazy(()=>import('../components/Employee/EmpNewAccount'))
const AdminTransaction = lazy(()=>import('../components/Admin/Transaction'))
const AdminRate = lazy(()=>import('../components/Admin/UpdateRate/index'))
const CustomerDashboard = lazy(()=>import('../components/Customer/index'))
const CustomerTransaction = lazy(()=>import('../components/Customer/Transaction/index'))
const AdminProperty = lazy(()=>import('../components/Admin/MyMoney/index'))
const PageNotFound = lazy(()=>import("../components/PageNotFound"))



const App = () => {
  return (
    <BrowserRouter>
    <Suspense fallback={<Loader/>}>
         <Routes>
        <Route path='/' element={<Homepage />} />
        {/* Start admin related routes */}
        <Route path='/admin' element={<Guard endpoint={"/api/verify-token"} role="admin">
          <Dashboard />
        </Guard>}>
          <Route index element={<Dashboard />} />
          <Route path='exchange' element={<AdminExchange />} />
          <Route path='rate' element={<AdminRate />} />
          <Route path='new-employee' element={<NewEmployee />} />
          <Route path='branding' element={<Branding />} />
          <Route path='branch' element={<Branch />} />
          <Route path='currency' element={<Currency />} />
          <Route path='new-account' element={<AdminNewAccount />} />
          <Route path='new-transaction' element={<AdminTransaction />} />
          <Route path='property' element={<AdminProperty />} />
          <Route path='*' element={<PageNotFound />} />
        </Route>
        {/* End admin related routes */}

        {/* Start employee related routes */}
        <Route path='/employee/' element={<Guard endpoint={"/api/verify-token"} role="employee">
          <EmployeeDashboard />
        </Guard>}>
          <Route index element={<EmployeeDashboard />} />
          <Route path='new-account' element={<EmpNewAccount />} />
          <Route path='new-transaction' element={<EmpTransaction />} />
          <Route path='*' element={<PageNotFound />} />
        </Route>
        {/* End employee related routes */}


        {/* Start customer related routes */}
        <Route path='/customer/' element={<Guard endpoint={"/api/verify-token"} role="customer">
          <EmployeeDashboard />
        </Guard>}>
          <Route index element={<CustomerDashboard />} />
          <Route path='transaction' element={<CustomerTransaction />} />
          <Route path='*' element={<PageNotFound />} />
        </Route>
        {/* End customer related routes */}

        {/* Catch all other routes */}
        <Route path='*' element={<PageNotFound />} />
      </Routes>
    </Suspense>
   
    </BrowserRouter>

  )

}

export default App