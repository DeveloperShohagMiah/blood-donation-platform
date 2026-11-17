import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import FindDonors from "./FindDonors";
import { apiFetch, toInternationalPhone } from "../utils/api";

const emptyFilters = {
    bloodGroup: "",
    division: "",
    district: "",
    upazila: "",
};

const FindDonorsPage = () => {
    const { i18n } = useTranslation();
    const language = i18n.resolvedLanguage?.startsWith("bn") ? "bn" : "en";

    const [locations, setLocations] = useState([]);
    const [donors, setDonors] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [filters, setFilters] = useState(emptyFilters);
    const [page, setPage] = useState(1);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /* Contact-request modal state */
    const [contactDonor, setContactDonor] = useState(null);
    const [contactForm, setContactForm] = useState({
        requesterName: "",
        requesterPhone: "",
        message: "",
    });
    const [contactError, setContactError] = useState("");
    const [contactSending, setContactSending] = useState(false);
    const [contactSent, setContactSent] = useState(false);

    useEffect(() => {
        let active = true;
        apiFetch("/locations")
            .then((data) => {
                if (active) setLocations(data?.items || []);
            })
            .catch(() => {
                // Search still works; only the location dropdowns are affected.
            });
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });
        params.set("page", String(page));
        params.set("limit", "12");

        apiFetch(`/donors/search?${params.toString()}`)
            .then((data) => {
                if (!active) return;
                setDonors(data?.items || []);
                setPagination(
                    data?.pagination || { page: 1, pages: 1, total: 0 }
                );
            })
            .catch((err) => {
                if (active) setError(err.message);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [filters, page]);

    const { divisions, districts, upazilas } = useMemo(() => {
        return {
            divisions: locations.filter((item) => item.type === "division"),
            districts: locations
                .filter((item) => item.type === "district")
                .map((item) => ({ ...item, divisionId: item.parent })),
            upazilas: locations
                .filter((item) => item.type === "upazila")
                .map((item) => ({ ...item, districtId: item.parent })),
        };
    }, [locations]);

    const handleSearch = (values) => {
        setLoading(true);
        setError(null);
        setFilters(values);
        setPage(1);
    };

    const handlePageChange = (nextPage) => {
        setLoading(true);
        setError(null);
        setPage(nextPage);
    };

    const openContact = (donorId) => {
        const donor = donors.find((item) => item._id === donorId);
        if (!donor) return;
        setContactDonor(donor);
        setContactForm({ requesterName: "", requesterPhone: "", message: "" });
        setContactError("");
        setContactSent(false);
    };

    const closeContact = () => {
        setContactDonor(null);
        setContactError("");
    };

    const submitContact = async (event) => {
        event.preventDefault();
        setContactError("");
        setContactSending(true);
        try {
            await apiFetch("/contact-requests", {
                method: "POST",
                body: {
                    donorId: contactDonor._id,
                    requesterName: contactForm.requesterName.trim(),
                    requesterPhone: toInternationalPhone(contactForm.requesterPhone),
                    message: contactForm.message.trim(),
                },
            });
            setContactSent(true);
        } catch (err) {
            setContactError(err.message);
        } finally {
            setContactSending(false);
        }
    };

    return (
        <>
            <FindDonors
                donors={donors}
                divisions={divisions}
                districts={districts}
                upazilas={upazilas}
                isLoading={isLoading}
                error={error}
                totalDonors={pagination.total}
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onSearch={handleSearch}
                onPageChange={handlePageChange}
                onContactRequest={openContact}
                language={language}
            />

            {contactDonor && (
                <div
                    className="fixed inset-0 z-[70] grid place-items-center bg-[#0B1210]/60 p-4 backdrop-blur-sm"
                    onClick={closeContact}
                    role="presentation"
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="contact-dialog-title"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 id="contact-dialog-title" className="text-xl font-extrabold text-[#192623]">
                                    {contactSent ? "Request sent" : "Request contact"}
                                </h2>
                                <p className="mt-1 text-sm text-[#829089]">
                                    {contactDonor.fullName} · {contactDonor.bloodGroup}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeContact}
                                aria-label="Close"
                                className="grid size-9 place-items-center rounded-full text-[#829089] transition hover:bg-[#F1F5F3] hover:text-[#192623]"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        {contactSent ? (
                            <div className="mt-6 rounded-xl bg-[#EDF8F1] p-4 text-sm leading-relaxed text-[#1E8E5A]">
                                Your request has been sent to our team. They will
                                coordinate the introduction and protect both
                                parties’ contact details.
                            </div>
                        ) : (
                            <form onSubmit={submitContact} className="mt-6 space-y-4">
                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-semibold text-[#34423B]">
                                        Your name
                                    </span>
                                    <input
                                        required
                                        value={contactForm.requesterName}
                                        onChange={(e) =>
                                            setContactForm((f) => ({ ...f, requesterName: e.target.value }))
                                        }
                                        className="h-12 w-full rounded-xl border border-[#E4EAE6] bg-white px-4 text-sm outline-none transition focus:border-[#C62838] focus:ring-4 focus:ring-red-500/5"
                                        placeholder="Your full name"
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-semibold text-[#34423B]">
                                        Your phone number
                                    </span>
                                    <input
                                        required
                                        type="tel"
                                        value={contactForm.requesterPhone}
                                        onChange={(e) =>
                                            setContactForm((f) => ({ ...f, requesterPhone: e.target.value }))
                                        }
                                        className="h-12 w-full rounded-xl border border-[#E4EAE6] bg-white px-4 text-sm outline-none transition focus:border-[#C62838] focus:ring-4 focus:ring-red-500/5"
                                        placeholder="01XXXXXXXXX"
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-semibold text-[#34423B]">
                                        Message (optional)
                                    </span>
                                    <textarea
                                        rows={3}
                                        value={contactForm.message}
                                        onChange={(e) =>
                                            setContactForm((f) => ({ ...f, message: e.target.value }))
                                        }
                                        className="w-full resize-y rounded-xl border border-[#E4EAE6] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#C62838] focus:ring-4 focus:ring-red-500/5"
                                        placeholder="Tell the team why you need to contact this donor"
                                    />
                                </label>

                                {contactError && (
                                    <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-[#9F1D2B]">
                                        {contactError}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={contactSending}
                                    className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#C62838] px-5 text-sm font-bold text-white transition hover:bg-[#A91F30] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {contactSending ? "Sending…" : "Send request"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default FindDonorsPage;
