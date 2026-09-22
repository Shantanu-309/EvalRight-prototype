import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './contexts/AuthContext'
import Home from './pages/Home'
import FeatureDetail from './pages/FeatureDetail'
import DiscoverEvalRight from './pages/DiscoverEvalRight'
import ContactUs from './pages/ContactUs'
import BGVIndia from './pages/BGVIndia'
import Login from './pages/Login'
import Register from './pages/Register'
import ClientPortalLayout from './pages/client-portal/ClientPortalLayout'
import ClientPortalHome from './pages/client-portal/ClientPortalHome'
import ClientPortalOrders from './pages/client-portal/ClientPortalOrders'
import ManualOrderEntry from './pages/client-portal/orders/ManualOrderEntry'
import InviteOrder from './pages/client-portal/orders/InviteOrder'
import ClientPortalReports from './pages/client-portal/ClientPortalReports'
import AllOrderDetails from './pages/client-portal/reports/AllOrderDetails'
import OrdersList from './pages/client-portal/reports/OrdersList'
import DraftOrderList from './pages/client-portal/reports/DraftOrderList'
import OrderSummaryReport from './pages/client-portal/reports/OrderSummaryReport'
import ElectronicConsents from './pages/client-portal/reports/ElectronicConsents'
import AdverseWorksheets from './pages/client-portal/reports/AdverseWorksheets'
import AdverseActionsLog from './pages/client-portal/reports/AdverseActionsLog'
import Analytics from './pages/client-portal/reports/Analytics'
import HRIntegrations from './pages/client-portal/reports/HRIntegrations'
import ClientPortalApplicants from './pages/client-portal/ClientPortalApplicants'
import ApplicantListTable from './pages/client-portal/applicants/ApplicantListTable'
import CandidateProfileCard from './pages/client-portal/applicants/CandidateProfileCard'
import NotesSection from './pages/client-portal/applicants/NotesSection'
import ApplicantInviteTemplates from './pages/client-portal/applicants/ApplicantInviteTemplates'
import ApplicantStatistics from './pages/client-portal/applicants/ApplicantStatistics'
import ClientPortalDrugScreening from './pages/client-portal/ClientPortalDrugScreening'
import DrugScreeningDashboard from './pages/client-portal/drug-screening/DrugScreeningDashboard'
import ClinicLocatorMap from './pages/client-portal/drug-screening/ClinicLocatorMap'
import ResultsInbox from './pages/client-portal/drug-screening/ResultsInbox'
import ClientPortalInvoices from './pages/client-portal/ClientPortalInvoices'
import InvoiceList from './pages/client-portal/invoices/InvoiceList'
import Payment from './pages/client-portal/invoices/Payment'
import InvoiceHistory from './pages/client-portal/invoices/InvoiceHistory'
import BillingContactInfo from './pages/client-portal/invoices/BillingContactInfo'
import ClientPortalSettings from './pages/client-portal/ClientPortalSettings'
import CompanyProfile from './pages/client-portal/settings/CompanyProfile'
import UserManagement from './pages/client-portal/settings/UserManagement'
import ManageBranches from './pages/client-portal/settings/ManageBranches'
import PackageConfig from './pages/client-portal/settings/PackageConfig'
import Notifications from './pages/client-portal/settings/Notifications'
import BulkOrderRequests from './pages/client-portal/support/BulkOrderRequests'
import FormsDocuments from './pages/client-portal/support/FormsDocuments'
import EmailActivityLog from './pages/client-portal/support/EmailActivityLog'
import EmployeeOnboard from './pages/employee/EmployeeOnboard'
import EmployeePortal from './pages/employee/EmployeePortal'

function AnimatedRoutes() {
  const location = useLocation()
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/features/:featureId" element={<FeatureDetail />} />
        <Route path="/discover-evalright" element={<DiscoverEvalRight />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/bgv-india" element={<BGVIndia />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Employee Portal Routes (Invite-Only) */}
        <Route path="/employee/onboard" element={<EmployeeOnboard />} />
        <Route path="/candidate/portal" element={<EmployeePortal />} />
        
        {/* Client Portal Routes */}
        <Route path="/client-portal" element={<ClientPortalLayout />}>
          <Route index element={<ClientPortalHome />} />
          <Route path="home" element={<ClientPortalHome />} />
          
          {/* Orders */}
          <Route path="orders" element={<ClientPortalOrders />} />
          <Route path="orders/manual-entry" element={<ManualOrderEntry />} />
          <Route path="orders/invite-order" element={<InviteOrder />} />
          
          {/* Reports */}
          <Route path="reports" element={<ClientPortalReports />} />
          <Route path="reports/all-orders" element={<AllOrderDetails />} />
          <Route path="reports/orders-list" element={<OrdersList />} />
          <Route path="reports/draft-orders" element={<DraftOrderList />} />
          <Route path="reports/summary-report" element={<OrderSummaryReport />} />
          <Route path="reports/consents" element={<ElectronicConsents />} />
          <Route path="reports/worksheets" element={<AdverseWorksheets />} />
          <Route path="reports/adverse-actions" element={<AdverseActionsLog />} />
          <Route path="reports/analytics" element={<Analytics />} />
          <Route path="reports/integrations" element={<HRIntegrations />} />
          
          {/* Applicants */}
          <Route path="applicants" element={<ClientPortalApplicants />} />
          <Route path="applicants/list" element={<ApplicantListTable />} />
          <Route path="applicants/templates" element={<ApplicantInviteTemplates />} />
          <Route path="applicants/statistics" element={<ApplicantStatistics />} />
          <Route path="applicants/profile/:candidateId" element={<CandidateProfileCard />} />
          <Route path="applicants/notes" element={<NotesSection />} />
          
          {/* Drug Screening */}
          <Route path="drug-screening" element={<DrugScreeningDashboard />} />
          <Route path="drug-screening/locator" element={<ClinicLocatorMap />} />
          <Route path="drug-screening/results" element={<ResultsInbox />} />
          
          {/* Invoices */}
          <Route path="invoices" element={<InvoiceList />} />
          <Route path="invoices/pay" element={<Payment />} />
          <Route path="invoices/history" element={<InvoiceHistory />} />
          <Route path="invoices/billing-info" element={<BillingContactInfo />} />
          
          {/* Settings */}
          <Route path="settings" element={<ClientPortalSettings />} />
          <Route path="settings/company" element={<CompanyProfile />} />
          <Route path="settings/users" element={<UserManagement />} />
          <Route path="settings/branches" element={<ManageBranches />} />
          <Route path="settings/packages" element={<PackageConfig />} />
          <Route path="settings/notifications" element={<Notifications />} />
          
          {/* Support Center */}
          <Route path="support/bulk-orders" element={<BulkOrderRequests />} />
          <Route path="support/forms" element={<FormsDocuments />} />
          <Route path="support/email-log" element={<EmailActivityLog />} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AnimatedRoutes />
      </AuthProvider>
    </Router>
  )
}

export default App
