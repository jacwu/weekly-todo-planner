import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { RotateCcw } from '@phosphor-icons/react'
import tasksData from './tasks.json'

type TaskData = Record<string, string[]>
type CompletionState = Record<string, Record<number, boolean>>

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function App() {
  const [completionState, setCompletionState, deleteCompletionState] = useKV<CompletionState>('weekly-todo-completion', {})
  const [tasks, setTasks] = useState<TaskData>({})

  useEffect(() => {
    try {
      setTasks(tasksData)
    } catch (error) {
      console.error('Failed to load tasks:', error)
      setTasks({})
    }
  }, [])

  const handleTaskToggle = (day: string, taskIndex: number) => {
    setCompletionState((current) => ({
      ...current,
      [day]: {
        ...current[day],
        [taskIndex]: !current[day]?.[taskIndex]
      }
    }))
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all task completion states?')) {
      setCompletionState({})
    }
  }

  const isTaskCompleted = (day: string, taskIndex: number) => {
    return completionState[day]?.[taskIndex] || false
  }

  const getCompletedCount = (day: string) => {
    const dayTasks = tasks[day] || []
    const dayCompletion = completionState[day] || {}
    return Object.values(dayCompletion).filter(Boolean).length
  }

  const getTotalTasks = (day: string) => {
    return tasks[day]?.length || 0
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Weekly Todo List</h1>
            <p className="text-muted-foreground mt-1">Organize your tasks by day of the week</p>
          </div>
          <Button 
            onClick={handleReset}
            variant="outline"
            className="flex items-center gap-2 hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <RotateCcw size={16} />
            Reset All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
          {DAYS_OF_WEEK.map((day, dayIndex) => (
            <Card key={day} className="h-96">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-secondary-foreground">
                    {DAY_LABELS[dayIndex]}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {getCompletedCount(day)}/{getTotalTasks(day)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks[day]?.length > 0 ? (
                  tasks[day].map((task, taskIndex) => (
                    <div
                      key={taskIndex}
                      className="flex items-start gap-3 group"
                    >
                      <Checkbox
                        id={`${day}-${taskIndex}`}
                        checked={isTaskCompleted(day, taskIndex)}
                        onCheckedChange={() => handleTaskToggle(day, taskIndex)}
                        className="mt-0.5 flex-shrink-0"
                      />
                      <label
                        htmlFor={`${day}-${taskIndex}`}
                        className={`text-sm leading-relaxed cursor-pointer transition-colors ${
                          isTaskCompleted(day, taskIndex)
                            ? 'line-through text-muted-foreground'
                            : 'text-foreground hover:text-primary'
                        }`}
                      >
                        {task}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">No tasks configured</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App