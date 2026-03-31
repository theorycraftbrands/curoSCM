"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { createNote, deleteNote } from "@/actions/notes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Trash2, Send } from "lucide-react";

interface Note {
  id: string;
  content: string;
  created_by: string;
  created_at: string;
  profile?: { full_name: string | null } | null;
}

interface NotesPanelProps {
  entityType: string;
  entityId: string;
  notes: Note[];
  currentUserId: string;
}

export function NotesPanel({
  entityType,
  entityId,
  notes,
  currentUserId,
}: NotesPanelProps) {
  const pathname = usePathname();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!content.trim()) return;
    setLoading(true);
    await createNote(entityType, entityId, content.trim(), pathname);
    setContent("");
    setLoading(false);
  }

  async function handleDelete(noteId: string) {
    await deleteNote(noteId, pathname);
  }

  return (
    <div className="space-y-4">
      {/* Add note */}
      <div className="flex gap-2">
        <Textarea
          placeholder="Add a note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[80px] resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
          }}
        />
      </div>
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={loading || !content.trim()}
        >
          <Send className="mr-1.5 h-3.5 w-3.5" />
          {loading ? "Saving..." : "Add Note"}
        </Button>
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
          <p className="mt-2 text-sm text-muted-foreground">No notes yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="group rounded-lg border bg-muted/30 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="whitespace-pre-wrap text-sm">{note.content}</p>
                </div>
                {note.created_by === currentUserId && (
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium">
                  {note.profile?.full_name || "Unknown"}
                </span>
                <span>&middot;</span>
                <span>
                  {new Date(note.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
