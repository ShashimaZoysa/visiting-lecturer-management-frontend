import axios from "axios";

// Create an Axios instance
const axiosInstance = axios.create({
    baseURL: "http://localhost:8080/api", // Replace with your API base URL
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Get the token from session storage
        const token = sessionStorage.getItem("token");
        console.log("Request Token:", token); // Log the token to ensure it's available

        // If token exists, attach it to the Authorization header
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }

        return config; // Return the updated config to proceed with the request
    },
    (error) => {
        // Handle any request errors
        return Promise.reject(error);
    }
);

// Add a response interceptor (optional for error handling)
axiosInstance.interceptors.response.use(
    (response) => {
        return response; // If the response is okay, return it
    },
    (error) => {
        // Handle errors, like 401 Unauthorized, globally
        if (error.response && error.response.status === 401) {
            console.log("Unauthorized - Please log in again.");
            // You could redirect to login page or log the user out
        }
        console.error("Response Error:", error); // Log the error details for debugging
        return Promise.reject(error); // Return the error for further handling
    }
);

export default axiosInstance;

