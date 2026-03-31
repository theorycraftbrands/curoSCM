"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NotesPanel } from "./notes-panel";
import { TasksPanel } from "./tasks-panel";
import { MessageSquare, CheckCircle2, Paperclip } from "lucide-react";

interface EntityTabsProps {
  entityType: string;
  entityId: string;
  currentUserId: string;
  notes: Array<{
    id: string;
    content: string;
    created_by: string;
    created_at: string;
    profile?: { full_name: string | null } | null;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    description: string | null;
    status: "open" | "in_progress" | "complete" | "cancelled";
    priority: "low" | "medium" | "high" | "urgent";
    due_date: string | null;
    assigned_to: string | null;
    created_at: string;
    profile?: { full_name: string | null } | null;
  }>;
  children?: React.ReactNode;
}

export function EntityTabs({
  entityType,
  entityId,
  currentUserId,
  notes,
  tasks,
  children,
}: EntityTabsProps) {
  const openTasks = tasks.filter(
    (t) => t.status === "open" || t.status === "in_progress"
  ).length;

  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="notes" className="gap-1.5">
          <MessageSquare className="h-3.5 w-3.5" />
          Notes
          {notes.length > 0 && (
            <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono tabular-nums">
              {notes.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="files" className="gap-1.5">
          <Paperclip className="h-3.5 w-3.5" />
          Files
        </TabsTrigger>
        <TabsTrigger value="tasks" className="gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Tasks
          {openTasks > 0 && (
            <span className="ml-1 rounded-full bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-mono tabular-nums">
              {openTasks}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="mt-4">
        {children}
      </TabsContent>

      <TabsContent value="notes" className="mt-4">
        <NotesPanel
          entityType={entityType}
          entityId={entityId}
          notes={notes}
          currentUserId={currentUserId}
        />
      </TabsContent>

      <TabsContent value="files" className="mt-4">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Paperclip className="h-8 w-8 text-muted-foreground/30" />
          <p className="mt-2 text-sm text-muted-foreground">
            File uploads coming soon
          </p>
        </div>
      </TabsContent>

      <TabsContent value="tasks" className="mt-4">
        <TasksPanel
          entityType={entityType}
          entityId={entityId}
          tasks={tasks}
        />
      </TabsContent>
    </Tabs>
  );
}
