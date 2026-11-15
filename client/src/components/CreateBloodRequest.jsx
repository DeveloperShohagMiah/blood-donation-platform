import BloodRequestForm from "../components/RequestBlood";

const CreateBloodRequest = () => {
    const handleCreateRequest = async (formData) => {
        // Connect your create blood request API here
        console.log(formData);
    };

    return (
        <BloodRequestForm
            onSubmit={handleCreateRequest}
            onCancel={() => window.history.back()}
        />
    );
};

export default CreateBloodRequest;