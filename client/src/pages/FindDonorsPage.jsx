import FindDonors from "./FindDonors";

const FindDonorsPage = () => {
    return (
        <FindDonors
            donors={donors}
            divisions={divisions}
            districts={districts}
            upazilas={upazilas}
            isLoading={isLoading}
            error={error}
            totalDonors={totalDonors}
            currentPage={currentPage}
            totalPages={totalPages}
            onSearch={handleSearch}
            onPageChange={handlePageChange}
            onContactRequest={handleContactRequest}
            language="en"
        />
    );
};

export default FindDonorsPage;