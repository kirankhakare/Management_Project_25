import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import UserWork from "./pages/UserWork";
import WeeklyBill from "./components/WeeklyBill";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/reports" element={<WeeklyBill/>} />
          <Route path="/user_work" element={<UserWork/>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
