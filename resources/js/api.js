const BASE = '/api';

export const getToken = () => localStorage.getItem('token');

export const getUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        return null;
    }
};

export const setSession = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
};

export const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export async function request(path, { method = 'GET', body } = {}) {
    const headers = { Accept: 'application/json' };
    if (body) headers['Content-Type'] = 'application/json';

    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(BASE + path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    let data = null;
    try {
        data = await res.json();
    } catch (e) {
        // walay JSON body
    }

    if (!res.ok) {
        const error = new Error(data?.message || 'Something went wrong.');
        error.status = res.status;
        error.errors = data?.errors || {};
        throw error;
    }

    return data;
}