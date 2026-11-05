import { ref } from 'vue';

const notification = ref(null);
let timer = null;

export function useNotification() {
    function notify(type, text, duration = 4000) {
        notification.value = { type, text };
        clearTimeout(timer);
        if (duration > 0) {
            timer = setTimeout(() => {
                notification.value = null;
            }, duration);
        }
    }

    function clearNotification() {
        notification.value = null;
    }

    return { notification, notify, clearNotification };
}