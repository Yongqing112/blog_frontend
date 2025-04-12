
import axios from 'axios';
import Cookies from 'universal-cookie';


export const get = (requestPath, callback, error_callback) => {
    axios.get(requestPath, {
        headers: { 'Authorization': getToken() }
    }).then((response) => {
        if(callback) {
            callback(response);
        }
    }).catch((error) => {
        console.log(error);
        if(error_callback) {
            error_callback(error)
        }
    });
}

export const post = (requestPath, payload, callback, error_callback) => {
    axios.post(requestPath, payload, {
        headers: { 'Authorization': getToken() }
    }).then((response) => {
        if(callback) {
            callback(response);
        }
    }).catch((error) => {
        console.log(error);
        if(error_callback) {
            error_callback(error)
        }
    });
}

export const put = (requestPath, payload, callback, error_callback) => {
    axios.put(requestPath, payload, {
        headers: { 'Authorization': getToken() }
    }).then((response) => {
        if(callback) {
            callback(response);
        }
    }).catch((error) => {
        console.log(error);
        if(error_callback) {
            error_callback(error)
        }
    });
}

export const async_put = (requestPath, payload, callback, error_callback) => {
    return axios.put(requestPath, payload, {
        headers: { 'Authorization': getToken() }
    }).then((response) => {
        if(callback) {
            callback(response);
        }
    }).catch((error) => {
        console.log(error);
        if(error_callback) {
            error_callback(error)
        }
    });
}

export const del = (requestPath, callback, error_callback) => {
    axios.delete(requestPath, {
        headers: { 'Authorization': getToken() }
    }).then((response) => {
        if(callback) {
            callback(response);
        }
    }).catch((error) => {
        console.log(error);
        if(error_callback) {
            error_callback(error)
        }
    });
}

const getToken = () => {
    const cookies = new Cookies();
    return cookies.get("accessToken");
}
