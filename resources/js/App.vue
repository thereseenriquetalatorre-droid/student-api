<script setup>
import { ref, onMounted } from 'vue';
import { useAuth } from './composables/useAuth';
import { useStudents } from './composables/useStudents';
import { useNotification } from './composables/useNotification';
import LoginForm from './components/LoginForm.vue';
import StudentTable from './components/StudentTable.vue';
import StudentForm from './components/StudentForm.vue';

const { user, isAuthenticated, isAdmin, roleLabel, logout, resetSession } = useAuth();
const {
    students,
    filteredStudents,
    isLoading,
    deletingId,
    searchText,
    fetchStudents,
    removeStudent,
    clearStudents,
} = useStudents();
const { notification, notify } = useNotification();

const showForm = ref(false);
const editing = ref(null);
const isLoggingOut = ref(false);


function handleApiError(e) {
    if (e.status === 401) {
        resetSession();
        clearStudents();
        showForm.value = false;
        notify('error', 'Session expired. Please login again.');
    } else if (e.status === 403) {
        notify('error', 'Access denied: you do not have permission to perform this action.');
    } else {
        notify('error', e.message);
    }
}

async function loadStudents() {
    try {
        await fetchStudents();
    } catch (e) {
        handleApiError(e);
    }
}

async function onLoggedIn() {
    notify('success', `Welcome, ${user.value.name}!`);
    await loadStudents();
}

async function handleLogout() {
    isLoggingOut.value = true;
    await logout();
    clearStudents();
    showForm.value = false;
    isLoggingOut.value = false;
    notify('success', 'Logged out successfully.');
}

function openAdd() {
    if (!isAdmin.value) return notify('error', 'Only administrators can add students.');
    editing.value = null;
    showForm.value = true;
}

function openEdit(student) {
    if (!isAdmin.value) return notify('error', 'Only administrators can edit students.');
    editing.value = student;
    showForm.value = true;
}

function onSaved(text) {
    showForm.value = false;
    notify('success', text);
}

function onFormFailed(e) {
    showForm.value = false;
    handleApiError(e);
}

async function handleDelete(student) {
    if (!isAdmin.value) return notify('error', 'Only administrators can delete students.');
    if (!confirm(`Delete ${student.first_name} ${student.last_name}?`)) return;
    try {
        const data = await removeStudent(student.id);
        notify('success', data.message || 'Student deleted successfully.');
    } catch (e) {
        handleApiError(e);
    }
}

onMounted(() => {
    if (isAuthenticated.value) loadStudents();
});
</script>

<template>
    <div class="container">
        <header>
            <h1>Student Management</h1>
            <div v-if="isAuthenticated" class="user-box">
                <span>{{ user.name }}</span>
                <span class="badge" :class="isAdmin ? 'badge-admin' : 'badge-user'">{{ roleLabel }}</span>
                <button class="btn small" :disabled="isLoggingOut" @click="handleLogout">
                    {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
                </button>
            </div>
        </header>

        <p v-if="notification" class="alert" :class="notification.type">{{ notification.text }}</p>

        <LoginForm v-if="!isAuthenticated" @logged-in="onLoggedIn" />

        <template v-else>
            <div class="toolbar">
                <h2>Student Records</h2>
                <div class="toolbar-right">
                    <input
                        v-model="searchText"
                        class="search"
                        type="text"
                        placeholder="Search name, number, course..."
                    />
                    <button v-if="isAdmin" class="btn primary" @click="openAdd">+ Add Student</button>
                </div>
            </div>

            <p v-if="!isAdmin" class="note">You are logged in as a Regular User (view only).</p>
            <p class="count">Showing {{ filteredStudents.length }} of {{ students.length }} students</p>

            <p v-if="isLoading" class="note"><span class="spinner"></span>Loading records...</p>
            <StudentTable
                v-else
                :students="filteredStudents"
                :is-admin="isAdmin"
                :deleting-id="deletingId"
                @edit="openEdit"
                @remove="handleDelete"
            />

            <StudentForm
                v-if="showForm"
                :student="editing"
                @saved="onSaved"
                @cancel="showForm = false"
                @failed="onFormFailed"
            />
        </template>
    </div>
</template>