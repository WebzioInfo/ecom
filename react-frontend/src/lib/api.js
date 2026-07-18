import axios from 'axios';
var baseURL = import.meta.env.VITE_API_URL;
if (!baseURL) {
    throw new Error('VITE_API_URL is not defined. Add VITE_API_URL to react-frontend/.env or your environment.');
}
export var api = axios.create({
    baseURL: baseURL,
    withCredentials: true,
});
api.interceptors.request.use(function (config) {
    var token = localStorage.getItem('access_token');
    if (token && config.headers) {
        config.headers.Authorization = "Bearer ".concat(token);
    }
    return config;
});
api.interceptors.response.use(function (response) { return response; }, function (error) {
    var _a;
    if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
        localStorage.removeItem('access_token');
        // Possible future redirect or global auth event
    }
    return Promise.reject(error);
});
