import { ref, computed } from 'vue';
import { request, getUser, getToken, setSession, clearSession } from '../api';


const user = ref(getUser());
const token = ref(getToken());
const isLoggingIn = ref(false);
const loginError = ref('');
const loginFieldErrors = ref({});

const isAuthenticated = computed(() => !!token.value && !!user.value);
const isAdmin = computed(() => user.value?.role === 'admin');
const roleLabel = computed(() => (isAdmin.value ? 'Administrator' : 'Regular User'));

export function useAuth() {
    async function login(email, password) {
        loginError.value = '';
        loginFieldErrors.value = {};
        isLoggingIn.value = true;
        try {
            const data = await request('/login', {
                method: 'POST',
                body: { email, password },
            });
            setSession(data.token, data.user);
            token.value = data.token;
            user.value = data.user;
            return true;
        } catch (e) {
            loginError.value = e.message;
            loginFieldErrors.value = e.errors || {};
            return false;
        } finally {
            isLoggingIn.value = false;
        }
    }

    function resetSession() {
        clearSession();
        token.value = null;
        user.value = null;
    }

    async function logout() {
        try {
            await request('/logout', { method: 'POST' });
        } catch (e) {
        
        }
        resetSession();
    }

    function clearLoginErrors() {
        loginError.value = '';
        loginFieldErrors.value = {};
    }

    return {
        user,
        token,
        isAuthenticated,
        isAdmin,
        roleLabel,
        isLoggingIn,
        loginError,
        loginFieldErrors,
        login,
        logout,
        resetSession,
        clearLoginErrors,
    };
}