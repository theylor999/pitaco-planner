
"use client";

// Inspired by react-hot-toast library
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1 // Show only one toast at a time
const TOAST_REMOVE_DELAY = 1000000 // Effectively infinite, toasts are dismissed by user or new toast

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

// Action types for the reducer
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0 // Counter for generating unique toast IDs

// Generates a unique ID for each toast
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

// All possible actions for the toast reducer
type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast> // For updating existing toasts
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"] // Optional: dismiss a specific toast or all
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"] // Optional: remove a specific toast or all
    }

// Shape of the toast state
interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

// Schedules a toast for removal from the DOM after a delay
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return // Already queued
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({ // Dispatch action to remove the toast
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

// Reducer function to manage toast state
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        // Add new toast to the beginning, and slice to maintain the limit
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // Side effect: schedule toast for removal when dismissed
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        // If no ID, dismiss all toasts
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false, // Set 'open' to false to trigger close animation
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        // Remove all toasts if no ID is specified
        return {
          ...state,
          toasts: [],
        }
      }
      // Filter out the toast with the specified ID
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = [] // Array of listener functions

let memoryState: State = { toasts: [] } // In-memory state

// Dispatches actions to the reducer and notifies listeners
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id"> // Public Toast type (ID is generated internally)

// Function to create and display a new toast
function toast({ ...props }: Toast) {
  const id = genId() // Generate a new ID for this toast

  // Functions to update or dismiss this specific toast
  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  // Add the new toast to the state
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true, // Toasts are open by default
      onOpenChange: (open) => { // Handle programmatic closing (e.g., swipe)
        if (!open) dismiss()
      },
    },
  })

  return { // Return methods to control this toast instance
    id: id,
    dismiss,
    update,
  }
}

// Hook to use the toast system
function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    // Subscribe to state changes
    listeners.push(setState)
    return () => {
      // Unsubscribe on component unmount
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast, // Function to create new toasts
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }), // Function to dismiss toasts
  }
}

export { useToast, toast }
