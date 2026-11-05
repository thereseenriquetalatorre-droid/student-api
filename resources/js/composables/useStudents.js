import { ref, computed } from 'vue';
import { request } from '../api';


const students = ref([]);
const isLoading = ref(false);
const deletingId = ref(null);
const searchText = ref('');

const filteredStudents = computed(() => {
    const q = searchText.value.trim().toLowerCase();
    if (!q) return students.value;
    return students.value.filter((s) =>
        `${s.first_name} ${s.last_name} ${s.student_number} ${s.course}`
            .toLowerCase()
            .includes(q)
    );
});

export function useStudents() {
    async function fetchStudents() {
        isLoading.value = true;
        try {
            students.value = await request('/students');
        } finally {
            isLoading.value = false;
        }
    }

    async function createStudent(payload) {
        const created = await request('/students', { method: 'POST', body: payload });
        students.value.unshift(created);
        return created;
    }

    async function updateStudent(id, payload) {
        const updated = await request(`/students/${id}`, { method: 'PUT', body: payload });
        const index = students.value.findIndex((s) => s.id === id);
        if (index !== -1) students.value[index] = updated;
        return updated;
    }

    async function removeStudent(id) {
        deletingId.value = id;
        try {
            const result = await request(`/students/${id}`, { method: 'DELETE' });
            students.value = students.value.filter((s) => s.id !== id);
            return result;
        } finally {
            deletingId.value = null;
        }
    }

    function clearStudents() {
        students.value = [];
        searchText.value = '';
    }

    return {
        students,
        filteredStudents,
        isLoading,
        deletingId,
        searchText,
        fetchStudents,
        createStudent,
        updateStudent,
        removeStudent,
        clearStudents,
    };
}