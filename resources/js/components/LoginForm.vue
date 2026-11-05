<script setup>
import { ref } from 'vue';
import { useAuth } from '../composables/useAuth';

const emit = defineEmits(['logged-in']);

const { login, isLoggingIn, loginError, loginFieldErrors, clearLoginErrors } = useAuth();

const email = ref('');
const password = ref('');

async function submit() {
    const ok = await login(email.value, password.value);
    if (ok) {
        password.value = '';
        emit('logged-in');
    }
}
</script>

<template>
    <form class="card login" novalidate @submit.prevent="submit">
        <h2>Login</h2>
        <p v-if="loginError" class="alert error">{{ loginError }}</p>

        <label for="email">Email</label>
        <input
            id="email"
            v-model="email"
            type="email"
            placeholder="admin@example.com"
            :class="{ invalid: loginFieldErrors.email }"
            @input="clearLoginErrors"
        />
        <small v-if="loginFieldErrors.email" class="field-error">{{ loginFieldErrors.email[0] }}</small>

        <label for="password">Password</label>
        <input
            id="password"
            v-model="password"
            type="password"
            :class="{ invalid: loginFieldErrors.password }"
            @input="clearLoginErrors"
        />
        <small v-if="loginFieldErrors.password" class="field-error">{{ loginFieldErrors.password[0] }}</small>

        <button type="submit" class="btn primary" :disabled="isLoggingIn">
            <span v-if="isLoggingIn" class="spinner"></span>
            {{ isLoggingIn ? 'Logging in...' : 'Login' }}
        </button>
    </form>
</template>