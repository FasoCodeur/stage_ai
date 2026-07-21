"use client"

import { createContext, useContext, useState, useCallback } from "react"

interface AIChatContextValue {
  courseTitle: string | undefined
  lessonTitle: string | undefined
  setAIChatContext: (courseTitle?: string, lessonTitle?: string) => void
}

const AIChatContext = createContext<AIChatContextValue>({
  courseTitle: undefined,
  lessonTitle: undefined,
  setAIChatContext: () => {},
})

export function AIChatProvider({ children }: { children: React.ReactNode }) {
  const [courseTitle, setCourseTitle] = useState<string | undefined>()
  const [lessonTitle, setLessonTitle] = useState<string | undefined>()

  const setAIChatContext = useCallback((course?: string, lesson?: string) => {
    setCourseTitle(course)
    setLessonTitle(lesson)
  }, [])

  return (
    <AIChatContext.Provider value={{ courseTitle, lessonTitle, setAIChatContext }}>
      {children}
    </AIChatContext.Provider>
  )
}

export function useAIChatContext() {
  return useContext(AIChatContext)
}
