import { CheckCircle, XCircle, AlertOctagon, Info, X } from 'lucide-react'
import { useToast } from './useToast.ts'
import type { ToastType } from './ToastTypes'

const toastStyles: Record<ToastType, string> = {
  success: 'bg-green-100 border-green-500 text-green-900',
  error: 'bg-red-100 border-red-500 text-red-900',
  warning: 'bg-yellow-100 border-yellow-500 text-yellow-900',
  info: 'bg-blue-100 border-blue-500 text-blue-900',
}

const toastIcons: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertOctagon,
  info: Info,
}

const iconColors: Record<ToastType, string> = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-15 right-4 z-[9999] space-y-2">
      {toasts.map(toast => {
        const Icon = toastIcons[toast.type]
        const iconColor = iconColors[toast.type]
        const style = toastStyles[toast.type]

        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 min-w-[300px] max-w-md px-2 py-1 rounded-lg border-l-4 shadow-lg ${style}`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 hover:opacity-70 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}