import { createContext } from 'react'
import type { ToastContextType } from './ToastTypes.ts'

export const ToastContext = createContext<ToastContextType | undefined>(undefined)