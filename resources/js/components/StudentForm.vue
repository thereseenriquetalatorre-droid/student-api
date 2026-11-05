<script setup>
import { reactive, ref } from 'vue';
import { request } from '../api';

const props = defineProps({
    student: { type: Object, default: null },
});
const emit = defineEmits(['saved', 'cancel']);

const fields = [
    { key: 'student_number', label: 'Student Number', type: 'text' },
    { key: 'first_name', label: 'First Name', type: 'text' },
    { key: 'last_name', label: 'Last Name', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'course', label: 'Course', type: 'text' },
    { key: 'year_level', label: 'Year Level (1 to 6)', type: 'number' },
];

const form = reactive({
    student_number: props.student?.student_number ?? '',
    first_name: props.student?.first_name ?? '',
    last_name: props.student?.last_name ?? '',
    email: props.student?.email ?? '',
    course: props.student?.course ?? '',
    year_level: props.student?.year_level ?? '',
});

const errors = ref({});
const error = ref('');
const saving = ref(false);

async function submit() {
    errors.value = {};
    error.value = '';
    saving.value = true;

    const body = {
        ...form,
        year_level: form.year_level === '' ? null : Number(form.year_level),
    };

    try {
        if (props.student) {
            await request(`/students/${props.student.id}`, { method: 'PUT', body });
            emit('saved', 'Student updated successfully.');
        } else {
            await request('/students', { method: 'POST', body });
            emit('saved', 'Student added successfully.');
        }
    } catch (e) {
        errors.value = e.errors;
        error.value = e.status === 422 ? 'Please fix the errors below.' : e.message;
    } finally {
        saving.value = false;
    }
}
</script>

<template>
    <div class="overlay" @click.self="$emit('cancel')">
        <div class="card modal">
            <h2>{{ student ? 'Edit Student' : 'Add Student' }}</h2>
            <p v-if="error" class="alert error">{{ error }}</p>

            <div v-for="f in fields" :key="f.key" class="field">
                <label>{{ f.label }}</label>
                <input v-model="form[f.key]" :type="f.type" :class="{ invalid: errors[f.key] }" />
                <small v-if="errors[f.key]" class="field-error">{{ errors[f.key][0] }}</small>
            </div>

            <div class="modal-actions">
                <button class="btn" @click="$emit('cancel')">Cancel</button>
                <button class="btn primary" :disabled="saving" @click="submit">
                    {{ saving ? 'Saving...' : 'Save' }}
                </button>
            </div>
        </div>
    </div>
</template>