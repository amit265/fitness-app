import { useAppStore, AlertButton } from '../store/useAppStore';

export const Alert = {
  alert: (title: string, message?: string, buttons?: AlertButton[]) => {
    useAppStore.getState().showAlert(title, message, buttons);
  }
};
