"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { createTask, updateTaskStatus } from "@/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, Plus, X } from "lucide-react";
import type { Database } from "@/lib/types/database";

type TaskStatus = Database["public"]["Enums"]["task_status"];

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Database["public"]["Enums"]["task_priority"];
  due_date: string | null;
  assigned_to: string | null;
  created_at: string;
  profile?: { full_name: string | null } | null;
}

interface TasksPanelProps {
  entityType: string;
  entityId: string;
  tasks: Task[];
}

const statusIcon: Record<TaskStatus, React.ReactNode> = {
  open: <Circle className="h-4 w-4 text-muted-foreground" />,
  in_progress: <Clock className="h-4 w-4 text-chart-2" />,
  complete: <CheckCircle2 className="h-4 w-4 text-chart-3" />,
  cancelled: <X className="h-4 w-4 text-muted-foreground/50" />,
};

const priorityVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  low: "outline",
  medium: "secondary",
  high: "default",
  urgent: "destructive",
};

const nextStatus: Record<TaskStatus, TaskStatus> = {
  open: "in_progress",
  in_progress: "complete",
  complete: "open",
  cancelled: "open",
};

export function TasksPanel({ entityType, entityId, tasks }: TasksPanelProps) {
  const pathname = usePathname();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!title.trim()) return;
    setLoading(true);
    await createTask(entityType, entityId, { title: title.trim() }, pathname);
    setTitle("");
    setShowForm(false);
    setLoading(false);
  }

  async function handleToggle(taskId: string, currentStatus: TaskStatus) {
    await updateTaskStatus(taskId, nextStatus[currentStatus], pathname);
  }

  return (
    <div className="space-y-3">
      {/* Add task */}
      {showForm ? (
        <div className="flex gap-2">
          <Input
            placeholder="Task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
          <Button size="sm" onClick={handleCreate} disabled={loading}>
            Add
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowForm(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowForm(true)}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Task
        </Button>
      )}

      {/* Tasks list */}
      {tasks.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle2 className="h-8 w-8 text-muted-foreground/30" />
          <p className="mt-2 text-sm text-muted-foreground">No tasks yet</p>
        </div>
      ) : (
        <div className="divide-y">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 py-2.5"
            >
              <button
                onClick={() => handleToggle(task.id, task.status)}
                className="shrink-0 transition-transform hover:scale-110"
              >
                {statusIcon[task.status]}
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm ${
                    task.status === "complete"
                      ? "text-muted-foreground line-through"
                      : "font-medium"
                  }`}
                >
                  {task.title}
                </p>
                {task.due_date && (
                  <p className="text-xs text-muted-foreground font-mono tabular-nums">
                    Due {task.due_date}
                  </p>
                )}
              </div>
              <Badge variant={priorityVariant[task.priority]} className="text-[10px]">
                {task.priority}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
