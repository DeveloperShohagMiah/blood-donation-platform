const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export class ApiError extends Error {
    constructor(message, { status = 0, data = null } = {}) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}

/**
 * Fetch wrapper for the Blood Connect API.
 * - sends/receives JSON and includes the auth cookie
 * - unwraps the server's { success, message, data } envelope
 * - throws ApiError with the server message and status code
 */
export async function apiFetch(path, { method = "GET", body, signal, headers } = {}) {
    let response;

    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            method,
            credentials: "include",
            signal,
            headers: {
                Accept: "application/json",
                ...(body === undefined ? {} : { "Content-Type": "application/json" }),
                ...headers,
            },
            body: body === undefined ? undefined : JSON.stringify(body),
        });
    } catch (error) {
        if (error.name === "AbortError") throw error;
        throw new ApiError(
            "Could not reach the server. Check your internet connection and try again.",
            { status: 0 }
        );
    }

    let payload = null;
    try {
        payload = await response.json();
    } catch {
        // Some endpoints (e.g. proxied errors) may not return JSON.
    }

    if (!response.ok) {
        throw new ApiError(payload?.message || `Request failed (${response.status})`, {
            status: response.status,
            data: payload,
        });
    }

    return payload?.data ?? payload;
}

/** Convert a Bangladeshi mobile number to the +880... format the API stores. */
export const toInternationalPhone = (value) => {
    const raw = String(value ?? "").trim();
    const digits = raw.replace(/\D/g, "");
    if (/^8801\d{9}$/.test(digits)) return `+${digits}`;
    if (/^01\d{9}$/.test(digits)) return `+88${digits}`;
    return raw;
};
