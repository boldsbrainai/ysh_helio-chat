export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )
  
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }
  }

  element.addEventListener('keydown', handleKeyDown)

  return () => {
    element.removeEventListener('keydown', handleKeyDown)
  }
}

export function focusFirstElement(container: HTMLElement, preventScroll = true) {
  const focusableElement = container.querySelector<HTMLElement>(
    'input:not([disabled]), button:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
  )
  
  if (focusableElement) {
    focusableElement.focus({ preventScroll })
  }
}

export function returnFocusToTrigger(triggerElement: HTMLElement | null, preventScroll = true) {
  if (triggerElement && document.contains(triggerElement)) {
    triggerElement.focus({ preventScroll })
  }
}

export function getScrollParent(element: HTMLElement): HTMLElement | null {
  if (!element) return null

  let parent = element.parentElement
  
  while (parent) {
    const overflowY = window.getComputedStyle(parent).overflowY
    if (overflowY === 'auto' || overflowY === 'scroll') {
      return parent
    }
    parent = parent.parentElement
  }
  
  return document.documentElement
}
