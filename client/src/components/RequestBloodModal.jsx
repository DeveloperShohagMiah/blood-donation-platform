import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, X } from "lucide-react";
import { apiFetch } from "../utils/api";
import BloodRequestForm from "./RequestBlood";

/** Modal shell: mounts fresh on every open so form/success state resets. */
const RequestBloodModal = ({ open, onClose, onSuccess }) =>
    open ? <ModalBody onClose={onClose} onSuccess={onSuccess} /> : null;

const ModalBody = ({ onClose, onSuccess }) => {
    const { t } = useTranslation();
    const [locations, setLocations] = useState([]);
    const [loadError, setLoadError] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const onCloseRef = useRef(onClose);
    const onSuccessRef = useRef(onSuccess);

    useEffect(() => {
        onCloseRef.current = onClose;
        onSuccessRef.current = onSuccess;
    }, [onClose, onSuccess]);

    useEffect(() => {
        let active = true;
        apiFetch("/locations")
            .then((data) => {
                if (active) setLocations(data?.items || []);
            })
            .catch((error) => {
                if (active) setLoadError(error.message);
            });

        const onKeyDown = (event) => {
            if (event.key === "Escape") onCloseRef.current?.();
        };
        document.addEventListener("keydown", onKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            active = false;
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    const submit = async (formData) => {
        await apiFetch("/blood-requests", { method: "POST", body: formData });
        setSubmitted(true);
        onSuccessRef.current?.();
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[80] overflow-y-auto bg-overlay p-3 backdrop-blur-sm sm:p-6"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={t("bloodRequest.form.title", "Create a blood request")}
                onClick={(event) => event.stopPropagation()}
                className="mx-auto my-4 w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:my-8"
            >
                <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-7">
                    <div>
                        <h2 className="text-lg font-extrabold tracking-tight text-foreground">
                            {submitted
                                ? t("text.Request submitted", "Request submitted")
                                : t("bloodRequest.form.title", "Create a blood request")}
                        </h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {submitted
                                ? t("text.Request submitted hint", "Your request is waiting for volunteer verification.")
                                : t("bloodRequest.form.subtitle", "Share the essential details so nearby donors can understand how and when to help.")}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t("text.Close", "Close")}
                        className="grid size-9 shrink-0 place-items-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                        <X size={19} />
                    </button>
                </div>

                {loadError && (
                    <p className="mx-5 mt-4 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning sm:mx-7">
                        {t("text.Location load error", "Locations could not be loaded")} ({loadError})
                    </p>
                )}

                {submitted ? (
                    <div className="grid place-items-center px-6 py-12 text-center">
                        <span className="grid size-16 place-items-center rounded-full bg-success-soft text-success-deep">
                            <CheckCircle2 size={34} />
                        </span>
                        <p className="mt-5 max-w-md text-sm leading-6 text-muted-foreground">
                            {t(
                                "text.Request submitted body",
                                "We'll notify you once a volunteer verifies it and shares it with matching donors."
                            )}
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn-premium h-10 px-5 text-sm"
                            >
                                {t("text.Done", "Done")}
                            </button>
                            <button
                                type="button"
                                onClick={() => setSubmitted(false)}
                                className="h-10 rounded-xl border border-border px-5 text-sm font-bold text-muted-foreground"
                            >
                                {t("text.Submit another", "Submit another")}
                            </button>
                        </div>
                    </div>
                ) : (
                    <BloodRequestForm
                        embedded
                        onSubmit={submit}
                        onCancel={onClose}
                        locations={locations}
                    />
                )}
            </div>
        </div>,
        document.body
    );
};

export default RequestBloodModal;
