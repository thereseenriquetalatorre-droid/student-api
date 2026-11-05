<script setup>
import { ref } from 'vue';
import { request, setSession } from '../api';

const emit = defineEmits(['logged-in']);

const email = ref('');
const password = ref('');
const error = ref('');
const errors = ref({});
const loading = ref(false);

async function submit() {
    error.value = '';
    errors.value = {};
    loading.value = true;
    try {
        const data = await request('/login', {
            method: 'POST',
            body: { email: email.value, password: password.value },
        });
        setSession(data.token, data.user);
        emit('logged-in', data.user);
    } catch (e) {
        error.value = e.message;
        errors.value = e.errors;
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div class="card login">
        <h2>Login</h2>
        <p v-if="error" class="alert error">{{ error }}</p>

        <label>Email</label>
        <input v-model="email" type="email" placeholder="admin@example.com" @keyup.enter="submit" />
        <small v-if="errors.email" class="field-error">{{ errors.email[0] }}</small>

        <label>Password</label>
        <input v-model="password" type="password" @keyup.enter="submit" />
        <small v-if="errors.password" class="field-error">{{ errors.password[0] }}</small>

        <button class="btn primary" :disabled="loading" @click="submit">
            {{ loading ? 'Logging in...' : 'Login' }}
        </button>
    </div>
</template>