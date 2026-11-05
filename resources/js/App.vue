<script setup>
import { ref, computed, onMounted } from 'vue';
import { request, getUser, clearSession } from './api';
import LoginForm from './components/LoginForm.vue';
import StudentTable from './components/StudentTable.vue';
import StudentForm from './components/StudentForm.vue';

const user = ref(getUser());
const students = ref([]);
const loading = ref(false);
const message = ref(null);
const showForm = ref(false);
const editing = ref(null);

const isAdmin = computed(() => user.value?.role === 'admin');

let timer = null;
function notify(type, text) {
    message.value = { type, text };
    clearTimeout(timer);
    timer = setTimeout(() => (message.value = null), 4000);
}

async function loadStudents() {
    loading.value = true;
    try {
        students.value = await request('/students');
    } catch (e) {
        if (e.status === 401) {
            clearSession();
            user.value = null;
            notify('error', 'Session expired. Please login again.');
        } else {
            notify('error', e.message);
        }
    } finally {
        loading.value = false;
    }
}

function onLoggedIn(u) {
    user.value = u;
    notify('success', `Welcome, ${u.name}!`);
    loadStudents();
}

async function logout() {
    try {
        await request('/logout', { method: 'POST' });
    } catch (e) {
        // ituloy ang logout bisan mo-error
    }
    clearSession();
    user.value = null;
    students.value = [];
    notify('success', 'Logged out successfully.');
}

function openAdd() {
    editing.value = null;
    showForm.value = true;
}

function openEdit(student) {
    editing.value = student;
    showForm.value = true;
}

function onSaved(text) {
    showForm.value = false;
    notify('success', text);
    loadStudents();
}

async function removeStudent(student) {
    if (!confirm(`Delete ${student.first_name} ${student.last_name}?`)) return;
    try {
        const data = await request(`/students/${student.id}`, { method: 'DELETE' });
        notify('success', data.message || 'Student deleted.');
        loadStudents();
    } catch (e) {
        notify('error', e.message);
    }
}

onMounted(() => {
    if (user.value) loadStudents();
});
</script>

<template>
    <div class="container">
        <header>
            <h1>Student Management</h1>
            <div v-if="user" class="user-box">
                <span>{{ user.name }} ({{ isAdmin ? 'Administrator' : 'Regular User' }})</span>
                <button class="btn small" @click="logout">Logout</button>
            </div>
        </header>

        <p v-if="message" class="alert" :class="message.type">{{ message.text }}</p>

        <LoginForm v-if="!user" @logged-in="onLoggedIn" />

        <template v-else>
            <div class="toolbar">
                <h2>Student Records</h2>
                <button v-if="isAdmin" class="btn primary" @click="openAdd">+ Add Student</button>
            </div>
            <p v-if="!isAdmin" class="note">You are logged in as a Regular User (view only).</p>

            <p v-if="loading" class="note">Loading...</p>
            <StudentTable
                v-else
                :students="students"
                :is-admin="isAdmin"
                @edit="openEdit"
                @remove="removeStudent"
            />

            <StudentForm
                v-if="showForm"
                :student="editing"
                @saved="onSaved"
                @cancel="showForm = false"
            />
        </template>
    </div>
</template>