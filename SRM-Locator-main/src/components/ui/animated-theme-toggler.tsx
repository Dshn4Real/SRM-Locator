"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { flushSync } from "react-dom"
import { Moon, Sun } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { setThemePreference } from "@/theme/theme"

type AnimatedThemeTogglerProps = {
  className?: string
}

export const AnimatedThemeToggler = ({ className }: AnimatedThemeTogglerProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const isTransitioningRef = useRef(false)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false
    return (
      document.documentElement.classList.contains("dark") ||
      document.documentElement.dataset.theme === "dark"
    )
  })

  useEffect(() => {
    const syncTheme = () => {
      const isDark =
        document.documentElement.classList.contains("dark") ||
        document.documentElement.dataset.theme === "dark"
      setDarkMode(isDark)
    }

    const observer = new MutationObserver(syncTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    })
    return () => observer.disconnect()
  }, [])

  const onToggle = useCallback(async () => {
    if (!buttonRef.current || isTransitioningRef.current) return
    isTransitioningRef.current = true

    const toggled = !darkMode

    const updateState = () => {
      flushSync(() => {
        setDarkMode(toggled)
        document.documentElement.classList.toggle("dark", toggled)
        document.documentElement.dataset.theme = toggled ? "dark" : "light"
        localStorage.setItem("theme", toggled ? "dark" : "light")
        try {
          setThemePreference(toggled ? "dark" : "light")
        } catch {
          // Fallback if standalone
        }
      })
    }

    if (!document.startViewTransition) {
      updateState()
      isTransitioningRef.current = false
      return
    }

    try {
      document.documentElement.classList.add("view-transition-active")
      const transition = document.startViewTransition(updateState)
      await transition.ready

      const { left, top, width, height } = buttonRef.current.getBoundingClientRect()
      const centerX = left + width / 2
      const centerY = top + height / 2
      const maxDistance = Math.hypot(
        Math.max(centerX, window.innerWidth - centerX),
        Math.max(centerY, window.innerHeight - centerY)
      )

      const anim = document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${centerX}px ${centerY}px)`,
            `circle(${maxDistance}px at ${centerX}px ${centerY}px)`,
          ],
        },
        {
          duration: 650,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      )
      await anim.finished.catch(() => {})
    } catch {
      // Fallback
    } finally {
      document.documentElement.classList.remove("view-transition-active")
      isTransitioningRef.current = false
    }
  }, [darkMode])

  return (
    <button
      ref={buttonRef}
      onClick={onToggle}
      aria-label="Switch theme"
      className={cn(
        "flex items-center justify-center p-2 rounded-full outline-none focus:outline-none active:outline-none focus:ring-0 cursor-pointer",
        className
      )}
      type="button"
    >
      <AnimatePresence mode="wait" initial={false}>
        {darkMode ? (
          <motion.span
            key="sun-icon"
            initial={{ opacity: 0, scale: 0.55, rotate: 25 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-white"
          >
            <Sun size={20} />
          </motion.span>
        ) : (
          <motion.span
            key="moon-icon"
            initial={{ opacity: 0, scale: 0.55, rotate: -25 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-black"
          >
            <Moon size={20} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
