import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import UserWork from "./pages/UserWork";
import WeeklyBill from "./components/WeeklyBill";
import DaysData from "./components/DaysData";
import PendingPayment from "./components/PendingPayment";
import SundayReport from "./components/SundayReport"
function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/reports" element={<WeeklyBill/>} />
          <Route path="/user_work" element={<UserWork/>} />
          <Route path="/days_data" element={<DaysData/>} />
          <Route path="/pending_payment" element={<PendingPayment/>} />
          <Route path="/sunday_report" element={<SundayReport/>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
