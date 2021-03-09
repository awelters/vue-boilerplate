import axios from 'axios'
import store from '../store'
import TokenService from '../services/storage.service'

const ApiService = {

    // Stores the 401 interceptor position so that it can be later ejected when needed
    _401interceptor: null,
    
    init(baseURL) {
        axios.defaults.baseURL = baseURL;
    },

    setHeader() {
        axios.defaults.headers.common["Authorization"] = `Bearer ${TokenService.getToken()}`
        axios.defaults.headers.common["Content-Type"] = 'application/json'
    },

    removeHeader() {
        axios.defaults.headers.common = {}
    },

    get(resource) {
        return axios.get(resource)
    },

    post(resource, data) {
        return axios.post(resource, data)
    },

    put(resource, data) {
        return axios.put(resource, data)
    },

    delete(resource) {
        return axios.delete(resource)
    },

    /**
     * Perform a custom Axios request.
     *
     * data is an object containing the following properties:
     *  - method
     *  - url
     *  - data ... request payload
     *  - auth (optional)
     *    - username
     *    - password
    **/
    customRequest(data) {
        return axios(data)
    },

    /**
     * Extra: How to refresh expired access token?
     * What’s a bit harder and skipped by so many tutorials when it comes to authentication is handling token refresh or 401 errors.
     * There are some use-cases where it’s good to simply logout the user when a 401 error happens, but let’s see how you can refresh
     * the access token without interrupting the user experience. So here is the 401 Interceptor we’ve had in the above code samples
     * mentioned already.
     * 
     * What the code does is intercept every API response and check if the status of the response is 401. If it is, we’re checking if
     * 401 occurred on the token refresh call itself (we don’t want to be caught in the loop of refreshing token forever!). The code 
     * then refreshes the token and retries the request that has failed and returns the response back to the caller.
     */
    mount401Interceptor() {
        this._401interceptor = axios.interceptors.response.use(
            (response) => {
                return response
            },
            async (error) => {
                 /* uncomment after testing */
                //if (error.request.status == 401) {
                    if (error.config.url.includes('/api/token/')) {
                        // Refresh token has failed. Logout the user
                        store.dispatch('auth/logout')
                        throw error
                    } else {
                        // Refresh the access token
                        try{
                            await store.dispatch('auth/refreshToken')
                            // Retry the original request
                            return this.customRequest({
                            /* uncomment after testing */
                            /*
                                method: error.config.method,
                                url: error.config.url,
                                data: error.config.data
                            */
                           /* comment out after testing */
                                url: '/api/token/force-error'
                            })
                        } catch (e) {
                            // Refresh has failed - reject the original request
                            throw error
                        }
                    }
                 /* uncomment after testing */
                //}

                // If error was not 401 just reject as is
                throw error
            }
        )
    },

    unmount401Interceptor() {
        // Eject the interceptor
        axios.interceptors.response.eject(this._401interceptor)
    },
}

export default ApiService