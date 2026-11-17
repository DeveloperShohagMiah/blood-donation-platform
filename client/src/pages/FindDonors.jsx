
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import Select from "../components/Select";
import {
    Search,
    MapPin,
    Droplets,
    ArrowRight,
    ShieldCheck,
    HeartHandshake,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    Users,
    AlertCircle,
} from "lucide-react";

const bloodGroups = [
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
];

const FindDonors = ({
    donors = [],
    divisions = [],
    districts = [],
    upazilas = [],
    isLoading = false,
    error = null,
    totalDonors = 0,
    currentPage = 1,
    totalPages = 1,
    onSearch = () => { },
    onPageChange = () => { },
    onContactRequest = () => { },
    language = "en",
}) => {
    const isBn = language === "bn";

    const content = {
        title: isBn ? "রক্তদাতা খুঁজুন" : "Find Blood Donors",
        subtitle: isBn
            ? "আপনার এলাকায় রক্তদাতা খুঁজে জীবন বাঁচাতে সাহায্য করুন।"
            : "Find available blood donors in your area and help save lives.",
        searchTitle: isBn ? "রক্তদাতা অনুসন্ধান করুন" : "Search Blood Donors",
        searchDescription: isBn
            ? "রক্তের গ্রুপ এবং অবস্থান নির্বাচন করে অনুসন্ধান করুন।"
            : "Find potential donors by selecting a blood group and location.",
        bloodGroup: isBn ? "রক্তের গ্রুপ" : "Blood Group",
        division: isBn ? "বিভাগ" : "Division",
        district: isBn ? "জেলা" : "District",
        upazila: isBn ? "উপজেলা" : "Upazila",
        allGroups: isBn ? "সকল রক্তের গ্রুপ" : "All Blood Groups",
        selectDivision: isBn ? "বিভাগ নির্বাচন করুন" : "Select Division",
        selectDistrict: isBn ? "জেলা নির্বাচন করুন" : "Select District",
        selectUpazila: isBn ? "উপজেলা নির্বাচন করুন" : "Select Upazila",
        search: isBn ? "রক্তদাতা খুঁজুন" : "Search Donors",
        clear: isBn ? "রিসেট" : "Clear Filters",
        results: isBn ? "অনুসন্ধানের ফলাফল" : "Search Results",
        available: isBn ? "রক্তদাতা পাওয়া যাচ্ছে" : "Available Donors",
        found: isBn ? "জন রক্তদাতা পাওয়া গেছে" : "donors found",
        noResults: isBn ? "কোনো রক্তদাতা পাওয়া যায়নি" : "No Donors Found",
        noResultsDescription: isBn
            ? "আপনার অনুসন্ধানের সাথে মিলে এমন কোনো রক্তদাতা পাওয়া যায়নি।"
            : "We couldn't find donors matching your search criteria.",
        tryAgain: isBn ? "অন্য অবস্থান বা রক্তের গ্রুপ নির্বাচন করুন।" : "Try another location or blood group.",
        availableStatus: isBn ? "রক্তদানে আগ্রহী" : "Available",
        lastDonation: isBn ? "সর্বশেষ রক্তদান" : "Last donation",
        notProvided: isBn ? "তথ্য দেওয়া হয়নি" : "Not provided",
        contact: isBn ? "যোগাযোগের অনুরোধ" : "Request Contact",
        verified: isBn ? "যাচাইকৃত" : "Verified",
        loading: isBn ? "রক্তদাতা খোঁজা হচ্ছে..." : "Finding donors...",
        errorTitle: isBn ? "তথ্য লোড করা যায়নি" : "Unable to load donors",
        errorDescription: isBn
            ? "অনুগ্রহ করে আবার চেষ্টা করুন।"
            : "Something went wrong. Please try again.",
        emergencyTitle: isBn ? "জরুরি ভিত্তিতে রক্ত প্রয়োজন?" : "Need Blood Urgently?",
        emergencyDescription: isBn
            ? "রক্তের অনুরোধ জমা দিন। আমাদের স্বেচ্ছাসেবীরা আপনাকে সহায়তা করবে।"
            : "Submit a blood request and let our volunteers help coordinate with potential donors.",
        requestBlood: isBn ? "রক্তের অনুরোধ করুন" : "Request Blood",
        privacyTitle: isBn ? "আপনার গোপনীয়তা আমাদের কাছে গুরুত্বপূর্ণ" : "Your Privacy Matters",
        privacyDescription: isBn
            ? "রক্তদাতার ব্যক্তিগত ফোন নম্বর এবং সঠিক ঠিকানা প্রকাশ করা হয় না।"
            : "Donor phone numbers and exact addresses are never displayed publicly.",
        howItWorks: isBn ? "যেভাবে কাজ করে" : "How It Works",
        step1: isBn ? "রক্তের গ্রুপ নির্বাচন করুন" : "Choose a Blood Group",
        step2: isBn ? "সম্ভাব্য রক্তদাতা খুঁজুন" : "Find Potential Donors",
        step3: isBn ? "যোগাযোগের অনুরোধ পাঠান" : "Request Contact",
        previous: isBn ? "আগের পৃষ্ঠা" : "Previous page",
        next: isBn ? "পরের পৃষ্ঠা" : "Next page",
        page: isBn ? "পৃষ্ঠা" : "Page",
        of: isBn ? "এর মধ্যে" : "of",
    };
    const steps = [
        {
            number: "01",
            icon: Search,
            title: content.step1,
            description: isBn
                ? "আপনার প্রয়োজনীয় রক্তের গ্রুপ এবং অবস্থান নির্বাচন করুন।"
                : "Select the blood group and location you need.",
        },
        {
            number: "02",
            icon: Users,
            title: content.step2,
            description: isBn
                ? "আপনার অনুসন্ধানের সাথে মিলে যাওয়া রক্তদাতাদের দেখুন।"
                : "Explore available donors matching your search.",
        },

        {
            number: "03",
            icon: HeartHandshake,
            title: content.step3,
            description: isBn
                ? "আমাদের স্বেচ্ছাসেবীদের মাধ্যমে যোগাযোগের অনুরোধ পাঠান।"
                : "Let our volunteers help coordinate communication.",
        },
    ];

    const {
        register,
        handleSubmit,
        reset,
        watch,
    } = useForm({
        defaultValues: {
            bloodGroup: "",
            division: "",
            district: "",
            upazila: "",
        },
    });

    const selectedDivision = watch("division");
    const selectedDistrict = watch("district");

    const filteredDistricts = useMemo(
        () =>
            districts.filter(
                (district) => district.divisionId === selectedDivision
            ),
        [districts, selectedDivision]
    );

    const filteredUpazilas = useMemo(
        () =>
            upazilas.filter(
                (upazila) => upazila.districtId === selectedDistrict
            ),
        [upazilas, selectedDistrict]
    );

    const submitSearch = (values) => {
        onSearch(values);
    };

    const clearFilters = () => {
        reset({
            bloodGroup: "",
            division: "",
            district: "",
            upazila: "",
        });

        onSearch({
            bloodGroup: "",
            division: "",
            district: "",
            upazila: "",
        });
    };

    const formatDate = (date) => {
        if (!date) return content.notProvided;

        return new Date(date).toLocaleDateString(
            isBn ? "bn-BD" : "en-GB",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            }
        );
    };

    return (
        <main className="min-h-screen bg-[#F8FAF9]">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#FFF3F3] via-white to-[#FFF8F5]">
                <div className="absolute -top-24 -right-20 size-80 rounded-full bg-[#E84B5B]/5 blur-3xl" />
                <div className="absolute -bottom-32 -left-20 size-80 rounded-full bg-[#E84B5B]/5 blur-3xl" />

                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#F4D3D6] bg-white px-4 py-2 text-xs font-bold tracking-wide text-[#C62838] shadow-sm">
                            <Droplets size={15} />
                            BLOOD CONNECT COMMUNITY
                        </span>

                        <h1 className="mt-6 text-4xl leading-tight font-extrabold tracking-tight text-[#192623] sm:text-5xl lg:text-6xl">
                            {content.title}
                            <span className="mt-2 block text-[#C62838]">
                                {isBn ? "এক ফোঁটা রক্ত, একটি জীবন" : "Give Blood. Save Lives."}
                            </span>
                        </h1>

                        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#68766F] sm:text-lg">
                            {content.subtitle}
                        </p>

                        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                            <a
                                href="#donor-search"
                                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#C62838] px-6 text-sm font-bold text-white shadow-lg shadow-red-900/10 transition hover:-translate-y-0.5 hover:bg-[#A91F30]"
                            >
                                <Search size={17} />
                                {content.search}
                            </a>

                            <a
                                href="/create-blood-requests"
                                className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[#E8D5D6] bg-white px-6 text-sm font-bold text-[#34423B] transition hover:border-[#C62838] hover:text-[#C62838]"
                            >
                                {content.requestBlood}
                                <ArrowRight size={16} />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Search */}
            <section
                id="donor-search"
                className="relative z-10 mx-auto -mt-5 max-w-7xl scroll-mt-24 px-4 sm:px-6 lg:px-8"
            >
                <div className="rounded-2xl border border-[#E9EFEB] bg-white p-5 shadow-[0_15px_50px_rgba(26,48,39,0.07)] sm:p-8">
                    <div className="mb-7">
                        <div className="flex items-center gap-3">
                            <div className="grid size-11 place-items-center rounded-xl bg-[#FFF0F1] text-[#C62838]">
                                <Search size={21} />
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-[#192623]">
                                    {content.searchTitle}
                                </h2>
                                <p className="mt-1 text-sm text-[#829089]">
                                    {content.searchDescription}
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(submitSearch)}>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Blood group */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[#34423B]">
                                    {content.bloodGroup}
                                </label>

                                <Select
                                    {...register("bloodGroup")}
                                    size="lg"
                                >
                                    <option value="">{content.allGroups}</option>
                                    {bloodGroups.map((group) => (
                                        <option key={group} value={group}>
                                            {group}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            {/* Division */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[#34423B]">
                                    {content.division}
                                </label>

                                <Select
                                    {...register("division", {
                                        onChange: () => {
                                            reset(
                                                (values) => ({
                                                    ...values,
                                                    district: "",
                                                    upazila: "",
                                                }),
                                                { keepDefaultValues: true }
                                            );
                                        },
                                    })}
                                    size="lg"
                                >
                                    <option value="">{content.selectDivision}</option>
                                    {divisions.map((division) => (
                                        <option key={division._id} value={division._id}>
                                            {isBn ? division.nameBn : division.nameEn}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            {/* District */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[#34423B]">
                                    {content.district}
                                </label>

                                <Select
                                    {...register("district", {
                                        onChange: () => {
                                            reset(
                                                (values) => ({
                                                    ...values,
                                                    upazila: "",
                                                }),
                                                { keepDefaultValues: true }
                                            );
                                        },
                                    })}
                                    disabled={!selectedDivision}
                                    size="lg"
                                >
                                    <option value="">{content.selectDistrict}</option>
                                    {filteredDistricts.map((district) => (
                                        <option key={district._id} value={district._id}>
                                            {isBn ? district.nameBn : district.nameEn}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            {/* Upazila */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[#34423B]">
                                    {content.upazila}
                                </label>

                                <Select
                                    {...register("upazila")}
                                    disabled={!selectedDistrict}
                                    size="lg"
                                >
                                    <option value="">{content.selectUpazila}</option>
                                    {filteredUpazilas.map((upazila) => (
                                        <option key={upazila._id} value={upazila._id}>
                                            {isBn ? upazila.nameBn : upazila.nameEn}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#EEF1EF] pt-5 sm:flex-row sm:items-center sm:justify-between">
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#E4EAE6] px-5 text-sm font-semibold text-[#68766F] transition hover:border-[#C62838] hover:text-[#C62838]"
                            >
                                <RotateCcw size={15} />
                                {content.clear}
                            </button>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#C62838] px-8 text-sm font-bold text-white shadow-lg shadow-red-900/10 transition hover:bg-[#A91F30] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Search size={17} />
                                {isLoading ? content.loading : content.search}
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            {/* Donor results */}
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <span className="text-xs font-bold tracking-[2px] text-[#C62838]">
                            BLOOD DONOR DIRECTORY
                        </span>
                        <h2 className="mt-2 text-2xl font-extrabold text-[#192623] sm:text-3xl">
                            {content.results}
                        </h2>
                        <p className="mt-2 text-sm text-[#829089]">
                            {content.available}
                        </p>
                    </div>

                    {!isLoading && !error && (
                        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#EDF8F1] px-4 py-2 text-sm font-semibold text-[#27834D]">
                            <Users size={16} />
                            {totalDonors} {content.found}
                        </div>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                        <AlertCircle className="mx-auto text-[#C62838]" size={30} />
                        <h3 className="mt-3 font-bold text-[#9F1D2B]">
                            {content.errorTitle}
                        </h3>
                        <p className="mt-2 text-sm text-[#A34A52]">
                            {content.errorDescription}
                        </p>
                    </div>
                )}

                {/* Loading */}
                {isLoading && (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <div
                                key={item}
                                className="h-56 animate-pulse rounded-2xl border border-[#E9EFEB] bg-white p-5"
                            >
                                <div className="flex gap-4">
                                    <div className="size-14 rounded-xl bg-gray-100" />
                                    <div className="flex-1 space-y-3 pt-1">
                                        <div className="h-4 w-2/3 rounded bg-gray-100" />
                                        <div className="h-3 w-1/2 rounded bg-gray-100" />
                                    </div>
                                </div>
                                <div className="mt-8 h-3 w-3/4 rounded bg-gray-100" />
                                <div className="mt-5 h-10 rounded-lg bg-gray-100" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && !error && donors.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-[#DCE5DF] bg-white px-5 py-16 text-center">
                        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#FFF0F1] text-[#C62838]">
                            <Search size={27} />
                        </div>
                        <h3 className="mt-5 text-xl font-bold text-[#192623]">
                            {content.noResults}
                        </h3>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#829089]">
                            {content.noResultsDescription}
                            {" "}
                            {content.tryAgain}
                        </p>
                        <button
                            onClick={clearFilters}
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#C62838] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#A91F30]"
                        >
                            <RotateCcw size={15} />
                            {content.clear}
                        </button>
                    </div>
                )}

                {/* Donor cards */}
                {!isLoading && !error && donors.length > 0 && (
                    <>
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {donors.map((donor) => {
                                const upazila = donor.upazila || donor.location?.upazila;
                                const district = donor.district || donor.location?.district;
                                return (
                                <article
                                    key={donor._id}
                                    className="group rounded-2xl border border-[#E8EEEA] bg-white p-5 shadow-[0_5px_20px_rgba(29,55,44,0.025)] transition duration-300 hover:-translate-y-1 hover:border-[#F0C5C9] hover:shadow-[0_15px_35px_rgba(29,55,44,0.07)]"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#FFF0F1] text-[#C62838]">
                                                <Droplets size={25} />
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="truncate font-bold text-[#192623]">
                                                    {donor.fullName}
                                                </h3>

                                                <div className="mt-1 flex items-center gap-1.5 text-xs text-[#829089]">
                                                    <MapPin size={13} />
                                                    <span className="truncate">
                                                        {isBn ? upazila?.nameBn : upazila?.nameEn}
                                                        {", "}
                                                        {isBn ? district?.nameBn : district?.nameEn}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#C62838] text-lg font-extrabold text-white shadow-md shadow-red-900/10">
                                            {donor.bloodGroup}
                                        </span>
                                    </div>

                                    <div className="mt-5 flex items-center justify-between gap-2 border-t border-b border-[#EEF1EF] py-4">
                                        <div>
                                            <p className="text-[11px] font-medium text-[#929D97]">
                                                {content.lastDonation}
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-[#34423B]">
                                                {formatDate(donor.lastDonationDate)}
                                            </p>
                                        </div>

                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EDF8F1] px-3 py-1.5 text-xs font-bold text-[#27834D]">
                                            <span className="size-1.5 rounded-full bg-[#35A467]" />
                                            {content.availableStatus}
                                        </span>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between gap-2">
                                        {donor.isVerified ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#43805C]">
                                                <ShieldCheck size={15} />
                                                {content.verified}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-[#929D97]">
                                                {isBn ? "যাচাই করা হয়নি" : "Not verified"}
                                            </span>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => onContactRequest(donor._id)}
                                            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#FFF0F1] px-3 text-xs font-bold text-[#C62838] transition hover:bg-[#C62838] hover:text-white"
                                        >
                                            {content.contact}
                                            <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </article>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                                <button
                                    type="button"
                                    disabled={currentPage <= 1}
                                    onClick={() => onPageChange(currentPage - 1)}
                                    aria-label={content.previous}
                                    className="grid size-10 place-items-center rounded-lg border border-[#E4EAE6] bg-white text-[#475650] transition hover:border-[#C62838] hover:text-[#C62838] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                <span className="text-sm font-medium text-[#68766F]">
                                    {content.page} {currentPage} {content.of} {totalPages}
                                </span>

                                <button
                                    type="button"
                                    disabled={currentPage >= totalPages}
                                    onClick={() => onPageChange(currentPage + 1)}
                                    aria-label={content.next}
                                    className="grid size-10 place-items-center rounded-lg border border-[#E4EAE6] bg-white text-[#475650] transition hover:border-[#C62838] hover:text-[#C62838] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* How it works */}
            <section className="border-y border-[#E9EFEB] bg-white py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <span className="text-xs font-bold tracking-[2px] text-[#C62838]">
                            SIMPLE PROCESS
                        </span>
                        <h2 className="mt-2 text-3xl font-extrabold text-[#192623]">
                            {content.howItWorks}
                        </h2>
                    </div>

                    <div className="mt-12 grid gap-8 md:grid-cols-3">
                        {steps.map((step, index) => {
                            const Icon = step.icon;

                            return (
                                <div
                                    key={step.number}
                                    className="relative text-center"
                                >
                                    {/* Connecting line */}
                                    {index !== steps.length - 1 && (
                                        <div className="absolute left-1/2 top-8 z-0 hidden w-full border-t-2 border-dashed border-[#E5B9BE] md:block" />
                                    )}
                                    {/* Icon */}
                                    <div className="relative z-10 mx-auto grid size-16 place-items-center rounded-2xl bg-[#FFF0F1] text-[#C62838]">
                                        <Icon size={27} />

                                        <span className="absolute -right-2 -top-2 grid size-7 place-items-center rounded-full bg-[#C62838] text-[10px] font-bold text-white">
                                            {step.number}
                                        </span>
                                    </div>

                                    <h3 className="mt-5 font-bold text-[#192623]">
                                        {step.title}
                                    </h3>

                                    <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[#829089]">
                                        {step.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Privacy */}
            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-4 rounded-2xl border border-[#E5ECE7] bg-[#F0F7F2] p-6 sm:flex-row sm:items-center sm:p-8">
                    <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white text-[#27834D] shadow-sm">
                        <ShieldCheck size={28} />
                    </div>

                    <div>
                        <h2 className="font-bold text-[#234B34]">
                            {content.privacyTitle}
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-[#62816D]">
                            {content.privacyDescription}
                        </p>
                    </div>
                </div>
            </section>

            {/* Emergency CTA */}
            <section className="px-4 pb-16 sm:px-6 lg:px-8">
                <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-r from-[#B91F32] to-[#D94350] px-6 py-12 text-center sm:px-12 sm:py-16">
                    <div className="absolute -top-20 -right-16 size-64 rounded-full border-[35px] border-white/5" />
                    <div className="absolute -bottom-28 -left-16 size-72 rounded-full border-[35px] border-white/5" />

                    <div className="relative">
                        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-white/15 text-white">
                            <Droplets size={28} />
                        </div>

                        <h2 className="mt-5 text-2xl font-extrabold text-white sm:text-3xl">
                            {content.emergencyTitle}
                        </h2>

                        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
                            {content.emergencyDescription}
                        </p>

                        <a
                            href="/create-blood-requests"
                            className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-[#C62838] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#FFF4F4]"
                        >
                            {content.requestBlood}
                            <ArrowRight size={17} />
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default FindDonors;
