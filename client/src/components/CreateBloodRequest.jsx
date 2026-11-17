import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { apiFetch } from "../utils/api";
import BloodRequestForm from "./RequestBlood";

const CreateBloodRequest = () => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [locations, setLocations] = useState([]);
    const [loadError, setLoadError] = useState("");
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate("/login", {
                replace: true,
                state: { from: "/create-blood-requests" },
            });
        }
    }, [authLoading, isAuthenticated, navigate]);

    useEffect(() => {
        let active = true;
        apiFetch("/locations")
            .then((data) => {
                if (active) setLocations(data?.items || []);
            })
            .catch((error) => {
                if (active) setLoadError(error.message);
            });
        return () => {
            active = false;
        };
    }, []);

    const handleCreateRequest = async (formData) => {
        await apiFetch("/blood-requests", {
            method: "POST",
            body: formData,
        });
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (authLoading || !isAuthenticated) {
        return (
            <div className="grid min-h-[60vh] place-items-center px-4 text-sm text-muted-foreground">
                Checking your session…
            </div>
        );
    }

    if (submitted) {
        return (
            <main className="grid min-h-[70vh] place-items-center bg-[#F8FAFB] px-4 py-20">
                <div className="w-full max-w-[520px] rounded-3xl bg-white p-8 text-center shadow-[0_24px_60px_rgba(11,16,32,0.1)] sm:p-12">
                    <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#E7F7EF] text-[#1E8E5A]">
                        <CheckCircle2 size={34} />
                    </span>
                    <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-[#192623]">
                        Request submitted
                    </h1>
                    <p className="mt-3 text-[15px] leading-relaxed text-[#66736E]">
                        Your blood request is waiting for volunteer verification.
                        We’ll notify you once it’s approved and shared with donors.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link
                            to="/donors"
                            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-white transition hover:brightness-95"
                        >
                            Find donors
                        </Link>
                        <button
                            type="button"
                            onClick={() => setSubmitted(false)}
                            className="inline-flex h-12 items-center justify-center rounded-full border border-[#E4EBE7] px-6 text-sm font-bold text-[#192623] transition hover:border-primary hover:text-primary"
                        >
                            Submit another request
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <>
            {loadError && (
                <div className="mx-auto mt-6 max-w-5xl px-4">
                    <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        Locations could not be loaded ({loadError}). The location
                        fields below will be empty.
                    </p>
                </div>
            )}
            <BloodRequestForm
                onSubmit={handleCreateRequest}
                onCancel={() => window.history.back()}
                locations={locations}
            />
        </>
    );
};

export default CreateBloodRequest;
