import toast from 'react-hot-toast'

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    icon: '✅',
    style: {
      background: '#10b981',
      color: '#fff',
      borderRadius: '8px',
      fontSize: '14px',
      padding: '12px 16px',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#10b981',
    },
    duration: 4000,
  })
}

export const showErrorToast = (message: string) => {
  toast.error(message, {
    icon: '❌',
    style: {
      background: '#ef4444',
      color: '#fff',
      borderRadius: '8px',
      fontSize: '14px',
      padding: '12px 16px',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#ef4444',
    },
    duration: 4000,
  })
}

export const showInfoToast = (message: string) => {
  toast(message, {
    icon: 'ℹ️',
    style: {
      background: '#3b82f6',
      color: '#fff',
      borderRadius: '8px',
      fontSize: '14px',
      padding: '12px 16px',
    },
    duration: 4000,
  })
}

export const showLoadingToast = (message: string) => {
  return toast.loading(message, {
    style: {
      background: '#6b7280',
      color: '#fff',
      borderRadius: '8px',
      fontSize: '14px',
      padding: '12px 16px',
    },
  })
}