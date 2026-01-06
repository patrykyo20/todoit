import { useEffect } from "react";

interface UseKeyboardShortcutsProps {
  isEnabled: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  onSave: () => void;
  onDelete: () => void;
}

/**
 * Custom hook for handling keyboard shortcuts in dialogs
 * 
 * Shortcuts:
 * - Enter: Save (when not in input/textarea)
 * - Cmd/Ctrl + S: Save (works everywhere)
 * - Cmd/Ctrl + Enter: Save (works everywhere)
 * - Cmd/Ctrl + Delete/Backspace: Delete
 */
export const useKeyboardShortcuts = ({
  isEnabled,
  isSaving,
  isDeleting,
  onSave,
  onDelete,
}: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if we're in ProseMirror editor
      const isInProseMirror = target.closest(".ProseMirror") !== null;
      
      const isInInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        isInProseMirror;

      // Save shortcuts (work everywhere)
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (!isSaving) {
          onSave();
        }
        return;
      }

      // Cmd/Ctrl + Enter: Save (works everywhere)
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isSaving) {
          onSave();
        }
        return;
      }

      // Enter: Save (only when not in input field or ProseMirror)
      if (
        !isInInputField &&
        e.key === "Enter" &&
        !e.shiftKey &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        e.preventDefault();
        if (!isSaving) {
          onSave();
        }
        return;
      }

      // Delete shortcuts
      if (
        (e.metaKey || e.ctrlKey) &&
        (e.key === "Delete" || e.key === "Backspace")
      ) {
        e.preventDefault();
        if (!isDeleting) {
          onDelete();
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEnabled, isSaving, isDeleting, onSave, onDelete]);
};
