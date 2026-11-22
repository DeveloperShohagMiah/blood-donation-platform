
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
    unions = [],
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
        union: isBn ? "ইউনিয়ন" : "Union",
        allGroups: isBn ? "সকল রক্তের গ্রুপ" : "All Blood Groups",
        selectDivision: isBn ? "বিভাগ নির্বাচন করুন" : "Select Division",
        selectDistrict: isBn ? "জেলা নির্বাচন করুন" : "Select District",
        selectUpazila: isBn ? "উপজেলা নির্বাচন করুন" : "Select Upazila",
        selectUnion: isBn ? "ইউনিয়ন নির্বাচন করুন" : "Select Union",
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
            union: "",
        },
    });

    const selectedBloodGroup = watch("bloodGroup");
    const selectedDivision = watch("division");
    const selectedDistrict = watch("district");
    const selectedUpazila = watch("upazila");
    const selectedUnion = watch("union");

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

    const filteredUnions = useMemo(
        () =>
            unions.filter(
                (union) => union.upazilaId === selectedUpazila
            ),
        [unions, selectedUpazila]
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
            union: "",
        });

        onSearch({
            bloodGroup: "",
            division: "",
            district: "",
            upazila: "",
            union: "",
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
        <div className="min-h-screen bg-surface-alt">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-card to-primary/5">
                <div className="absolute -top-24 -right-20 size-80 rounded-full bg-brand-light/5 blur-3xl" />
                <div className="absolute -bottom-32 -left-20 size-80 rounded-full bg-brand-light/5 blur-3xl" />

                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card px-4 py-2 text-xs font-bold tracking-wide text-primary shadow-sm">
                            <Droplets size={15} />
                            BLOOD CONNECT COMMUNITY
                        </span>

                        <h1 className="mt-6 text-4xl leading-tight font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                            {content.title}
                            <span className="mt-2 block text-primary">
                                {isBn ? "এক ফোঁটা রক্ত, একটি জীবন" : "Give Blood. Save Lives."}
                            </span>
                        </h1>

                        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                            {content.subtitle}
                        </p>

                        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                            <a
                                href="#donor-search"
                                className="btn-premium min-h-12 px-6 text-sm"
                            >
                                <Search size={17} />
                                {content.search}
                            </a>

                            <a
                                href="/create-blood-requests"
                                className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-primary/20 bg-card px-6 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary"
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
                <div className="rounded-2xl border border-border bg-card p-5 shadow-lg sm:p-8">
                    <div className="mb-7">
                        <div className="flex items-center gap-3">
                            <div className="grid size-11 place-items-center rounded-xl bg-primary/5 text-primary">
                                <Search size={21} />
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-foreground">
                                    {content.searchTitle}
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {content.searchDescription}
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(submitSearch)}>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
                            {/* Blood group */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-foreground">
                                    {content.bloodGroup}
                                </label>

                                <Select
                                    {...register("bloodGroup")}
                                    value={selectedBloodGroup}
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
                                <label className="mb-2 block text-sm font-semibold text-foreground">
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
                                                    union: "",
                                                }),
                                                { keepDefaultValues: true }
                                            );
                                        },
                                    })}
                                    value={selectedDivision}
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
                                <label className="mb-2 block text-sm font-semibold text-foreground">
                                    {content.district}
                                </label>

                                <Select
                                    {...register("district", {
                                        onChange: () => {
                                            reset(
                                                (values) => ({
                                                    ...values,
                                                    upazila: "",
                                                    union: "",
                                                }),
                                                { keepDefaultValues: true }
                                            );
                                        },
                                    })}
                                    value={selectedDistrict}
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
                                <label className="mb-2 block text-sm font-semibold text-foreground">
                                    {content.upazila}
                                </label>

                                <Select
                                    {...register("upazila")}
                                    value={selectedUpazila}
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

                            {/* Union */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-foreground">
                                    {content.union}
                                </label>
                                <Select
                                    {...register("union")}
                                    value={selectedUnion}
                                    disabled={!selectedUpazila}
                                    size="lg"
                                >
                                    <option value="">{content.selectUnion}</option>
                                    {filteredUnions.map((union) => (
                                        <option key={union._id} value={union._id}>
                                            {isBn ? union.nameBn : union.nameEn}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-5 text-sm font-semibold text-muted-foreground transition hover:border-primary hover:text-primary"
                            >
                                <RotateCcw size={15} />
                                {content.clear}
                            </button>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-premium min-h-12 px-8 text-sm"
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
                        <span className="text-xs font-bold tracking-[2px] text-primary">
                            BLOOD DONOR DIRECTORY
                        </span>
                        <h2 className="mt-2 text-2xl font-extrabold text-foreground sm:text-3xl">
                            {content.results}
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {content.available}
                        </p>
                    </div>

                    {!isLoading && !error && (
                        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-success-soft px-4 py-2 text-sm font-semibold text-success">
                            <Users size={16} />
                            {totalDonors} {content.found}
                        </div>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="rounded-2xl border border-destructive/25 bg-destructive/10 p-6 text-center">
                        <AlertCircle className="mx-auto text-primary" size={30} />
                        <h3 className="mt-3 font-bold text-primary-hover">
                            {content.errorTitle}
                        </h3>
                        <p className="mt-2 text-sm text-destructive">
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
                                className="h-56 animate-pulse rounded-2xl border border-border bg-card p-5"
                            >
                                <div className="flex gap-4">
                                    <div className="size-14 rounded-xl bg-muted" />
                                    <div className="flex-1 space-y-3 pt-1">
                                        <div className="h-4 w-2/3 rounded bg-muted" />
                                        <div className="h-3 w-1/2 rounded bg-muted" />
                                    </div>
                                </div>
                                <div className="mt-8 h-3 w-3/4 rounded bg-muted" />
                                <div className="mt-5 h-10 rounded-lg bg-muted" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && !error && donors.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-16 text-center">
                        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/5 text-primary">
                            <Search size={27} />
                        </div>
                        <h3 className="mt-5 text-xl font-bold text-foreground">
                            {content.noResults}
                        </h3>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                            {content.noResultsDescription}
                            {" "}
                            {content.tryAgain}
                        </p>
                        <button
                            onClick={clearFilters}
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary-hover"
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
                                        className="group rounded-2xl border border-border bg-card p-5 shadow-md transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary/5 text-primary">
                                                    <Droplets size={25} />
                                                </div>

                                                <div className="min-w-0">
                                                    <h3 className="truncate font-bold text-lg text-foreground">
                                                        {donor.fullName}
                                                    </h3>

                                                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <MapPin size={13} />
                                                        <span className="truncate">
                                                            {isBn ? upazila?.nameBn : upazila?.nameEn}
                                                            {", "}
                                                            {isBn ? district?.nameBn : district?.nameEn}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary text-lg font-extrabold text-primary-foreground shadow-md shadow-primary/10">
                                                {donor.bloodGroup}
                                            </span>
                                        </div>

                                        <div className="mt-5 flex items-center justify-between gap-2 border-t border-b border-border py-4">
                                            <div>
                                                <p className="text-[11px] font-medium text-muted-foreground">
                                                    {content.lastDonation}
                                                </p>
                                                <p className="mt-1 text-sm font-semibold text-foreground">
                                                    {formatDate(donor.lastDonationDate)}
                                                </p>
                                            </div>

                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1.5 text-xs font-bold text-success">
                                                <span className="size-1.5 rounded-full bg-success" />
                                                {content.availableStatus}
                                            </span>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between gap-2">
                                            {donor.isVerified ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-success-deep">
                                                    <ShieldCheck size={15} />
                                                    {content.verified}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">
                                                    {isBn ? "যাচাই করা হয়নি" : "Not verified"}
                                                </span>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => onContactRequest(donor._id)}
                                                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary/5 px-3 text-xs font-bold text-primary transition hover:bg-primary hover:text-primary-foreground"
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
                                    className="grid size-10 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                <span className="text-sm font-medium text-muted-foreground">
                                    {content.page} {currentPage} {content.of} {totalPages}
                                </span>

                                <button
                                    type="button"
                                    disabled={currentPage >= totalPages}
                                    onClick={() => onPageChange(currentPage + 1)}
                                    aria-label={content.next}
                                    className="grid size-10 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* How it works */}
            <section className="border-y border-border bg-card py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <span className="text-xs font-bold tracking-[2px] text-primary">
                            SIMPLE PROCESS
                        </span>
                        <h2 className="mt-2 text-3xl font-extrabold text-foreground">
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
                                        <div className="absolute left-1/2 top-8 z-0 hidden w-full border-t-2 border-dashed border-primary/30 md:block" />
                                    )}
                                    {/* Icon */}
                                    <div className="relative z-10 mx-auto grid size-16 place-items-center rounded-2xl bg-primary/5 text-primary">
                                        <Icon size={27} />

                                        <span className="absolute -right-2 -top-2 grid size-7 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                            {step.number}
                                        </span>
                                    </div>

                                    <h3 className="mt-5 font-bold text-foreground">
                                        {step.title}
                                    </h3>

                                    <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
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
                <div className="flex flex-col gap-4 rounded-2xl border border-border bg-success-soft p-6 sm:flex-row sm:items-center sm:p-8">
                    <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-card text-success shadow-sm">
                        <ShieldCheck size={28} />
                    </div>

                    <div>
                        <h2 className="font-bold text-success-deep">
                            {content.privacyTitle}
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-success-deep">
                            {content.privacyDescription}
                        </p>
                    </div>
                </div>
            </section>

            {/* Emergency CTA */}
            <section className="px-4 pb-16 sm:px-6 lg:px-8">
                <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-r from-primary-hover to-brand-light px-6 py-12 text-center sm:px-12 sm:py-16">
                    <div className="absolute -top-20 -right-16 size-64 rounded-full border-[35px] border-background/5" />
                    <div className="absolute -bottom-28 -left-16 size-72 rounded-full border-[35px] border-background/5" />

                    <div className="relative">
                        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-card/15 text-primary-foreground">
                            <Droplets size={28} />
                        </div>

                        <h2 className="mt-5 text-2xl font-extrabold text-primary-foreground sm:text-3xl">
                            {content.emergencyTitle}
                        </h2>

                        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-primary-foreground/80 sm:text-base">
                            {content.emergencyDescription}
                        </p>

                        <a
                            href="/create-blood-requests"
                            className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-card px-6 text-sm font-bold text-primary shadow-lg transition hover:-translate-y-0.5 hover:bg-primary/5"
                        >
                            {content.requestBlood}
                            <ArrowRight size={17} />
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default FindDonors;
