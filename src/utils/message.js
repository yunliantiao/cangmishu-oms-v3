import { Notify } from 'quasar';

export const successMessage = (message) => {
  Notify.create({
    message,
    position: 'top',
    type: 'positive',
  });
};

export const notify = (message) => {
  Notify.create({
    message,
    position: 'top',
  });
};

export const errorMessage = (message) => {
  Notify.create({
    message,
    position: 'top',
    type: 'negative',
  });
};

export const tipsMessage = (message) => {
  Notify.create({
    message,
    position: 'top',
    type: 'warning',
  });
};
export default {
  successMessage,
  notify,
  errorMessage,
  tipsMessage
}
