import { Route, Routes } from "react-router-dom";
import Layout from "./layouts/Layout";
import Home from "./pages/Home";
import BecomeDonor from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import CreateBloodRequest from "./components/CreateBloodRequest";
import FindDonorsPage from "./pages/FindDonorsPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PublicCampaigns from "./pages/Campaigns";
import BloodRequests from "./pages/BloodRequests";
import { RequireAuth, RequireRole } from "./components/RequireRole";

import DashboardLayout from "./pages/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import Notifications from "./pages/dashboard/Notifications";
import DonorProfile from "./pages/dashboard/donor/DonorProfile";
import MyRequests from "./pages/dashboard/donor/MyRequests";
import MatchingRequests from "./pages/dashboard/donor/MatchingRequests";
import DonationHistory from "./pages/dashboard/donor/DonationHistory";
import AssignedRequests from "./pages/dashboard/volunteer/AssignedRequests";
import VerificationQueue from "./pages/dashboard/volunteer/VerificationQueue";
import VolunteerProfile from "./pages/dashboard/volunteer/VolunteerProfile";
import UsersManagement from "./pages/dashboard/admin/UsersManagement";
import RequestsManagement from "./pages/dashboard/admin/RequestsManagement";
import ContactRequestsAdmin from "./pages/dashboard/admin/ContactRequestsAdmin";
import Campaigns from "./pages/dashboard/admin/Campaigns";
import Gallery from "./pages/dashboard/admin/Gallery";
import DonationsAdmin from "./pages/dashboard/admin/DonationsAdmin";
import AuditLogs from "./pages/dashboard/admin/AuditLogs";

const DONOR = ["user"];
const VOLUNTEER = ["volunteer"];
const STAFF = ["admin", "moderator"];

const App = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="become-donor" element={<BecomeDonor />} />
                <Route path="create-blood-requests" element={<CreateBloodRequest />} />
                <Route path="donors" element={<FindDonorsPage />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="campaigns" element={<PublicCampaigns />} />
                <Route path="blood-requests" element={<BloodRequests />} />
                <Route path="*" element={<div className="grid min-h-[60vh] place-items-center text-xl font-bold">404 Not Found</div>} />
            </Route>

            <Route
                path="/dashboard"
                element={
                    <RequireAuth>
                        <DashboardLayout />
                    </RequireAuth>
                }
            >
                <Route index element={<DashboardHome />} />
                <Route path="notifications" element={<Notifications />} />

                <Route path="profile" element={<RequireRole roles={DONOR}><DonorProfile /></RequireRole>} />
                <Route path="my-requests" element={<RequireRole roles={DONOR}><MyRequests /></RequireRole>} />
                <Route path="matching" element={<RequireRole roles={DONOR}><MatchingRequests /></RequireRole>} />
                <Route path="donations" element={<RequireRole roles={DONOR}><DonationHistory /></RequireRole>} />

                <Route path="assignments" element={<RequireRole roles={VOLUNTEER}><AssignedRequests /></RequireRole>} />
                <Route path="queue" element={<RequireRole roles={VOLUNTEER}><VerificationQueue /></RequireRole>} />
                <Route path="volunteer-profile" element={<RequireRole roles={VOLUNTEER}><VolunteerProfile /></RequireRole>} />

                <Route path="admin/users" element={<RequireRole roles={STAFF}><UsersManagement /></RequireRole>} />
                <Route path="admin/requests" element={<RequireRole roles={STAFF}><RequestsManagement /></RequireRole>} />
                <Route path="admin/contact-requests" element={<RequireRole roles={STAFF}><ContactRequestsAdmin /></RequireRole>} />
                <Route path="admin/campaigns" element={<RequireRole roles={STAFF}><Campaigns /></RequireRole>} />
                <Route path="admin/gallery" element={<RequireRole roles={STAFF}><Gallery /></RequireRole>} />
                <Route path="admin/donations" element={<RequireRole roles={STAFF}><DonationsAdmin /></RequireRole>} />
                <Route path="admin/audit" element={<RequireRole roles={STAFF}><AuditLogs /></RequireRole>} />
            </Route>
        </Routes>
    );
};

export default App;
