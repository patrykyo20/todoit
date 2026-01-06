"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { FC, useEffect, useRef, useState, useCallback, memo } from "react";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  CheckSquare,
} from "lucide-react";
import { Button } from "./Button";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

export const RichTextEditor: FC<RichTextEditorProps> = memo(
  ({
    value,
    onChange,
    placeholder = "Enter description...",
    className,
    editable = true,
  }) => {
    const isUpdatingRef = useRef(false);
    const previousValueRef = useRef<string>(value);
    const onChangeRef = useRef(onChange);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    const handleUpdate = useCallback(
      ({ editor: editorInstance }: { editor: { getHTML: () => string } }) => {
        const newValue = editorInstance.getHTML();
        
        if (newValue === previousValueRef.current) {
          return;
        }

        previousValueRef.current = newValue;
        isUpdatingRef.current = true;

        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
          onChangeRef.current(newValue);
          setTimeout(() => {
            isUpdatingRef.current = false;
          }, 50);
        }, 150);
      },
      []
    );

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          bulletList: {
            keepMarks: true,
            keepAttributes: false,
          },
          orderedList: {
            keepMarks: true,
            keepAttributes: false,
          },
        }),
        Image.configure({
          inline: true,
          allowBase64: true,
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: "text-primary underline",
          },
        }),
        TaskList.configure({
          HTMLAttributes: {
            class: "task-list not-prose",
          },
        }),
        TaskItem.configure({
          nested: true,
          HTMLAttributes: {
            class: "task-item flex gap-2",
          },
        }),
        Placeholder.configure({
          placeholder,
        }),
      ],
      content: value,
      editable,
      immediatelyRender: false,
      onUpdate: handleUpdate,
    });

    const generateUploadUrl = useAction(api.files.generateUploadUrl);
    const getImageUrl = useAction(api.files.getImageUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
      if (
        editor &&
        !isUpdatingRef.current &&
        value !== previousValueRef.current &&
        value !== editor.getHTML()
      ) {
        const { from, to } = editor.state.selection;
        editor.commands.setContent(value, { emitUpdate: false });
        editor.commands.setTextSelection({ from, to });
        previousValueRef.current = value;
      }
    }, [value, editor]);

    const uploadImage = useCallback(
      async (file: File) => {
        if (!editor) return;

        setIsUploading(true);
        try {
          const uploadUrl = await generateUploadUrl();

          const result = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
          });

          const { storageId } = await result.json();
          const imageUrl = await getImageUrl({ storageId });

          if (imageUrl) {
            editor.chain().focus().setImage({ src: imageUrl }).run();
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          if (file.size < 1000000) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const base64 = e.target?.result as string;
              editor.chain().focus().setImage({ src: base64 }).run();
            };
            reader.readAsDataURL(file);
          } else {
            alert("Image too large. Please use an image smaller than 1MB.");
          }
        } finally {
          setIsUploading(false);
        }
      },
      [editor, generateUploadUrl, getImageUrl]
    );

    useEffect(() => {
      if (!editor) return;

      const handlePaste = async (e: ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.indexOf("image") !== -1) {
            e.preventDefault();
            const file = item.getAsFile();
            if (file) {
              await uploadImage(file);
            }
          }
        }
      };

      const handleDrop = async (e: DragEvent) => {
        const files = e.dataTransfer?.files;
        if (!files || files.length === 0) return;

        e.preventDefault();
        const imageFile = Array.from(files).find((file) =>
          file.type.startsWith("image/")
        );
        if (imageFile) {
          await uploadImage(imageFile);
        }
      };

      const editorElement = editor.view.dom;
      editorElement.addEventListener("paste", handlePaste);
      editorElement.addEventListener("drop", handleDrop);

      return () => {
        editorElement.removeEventListener("paste", handlePaste);
        editorElement.removeEventListener("drop", handleDrop);
      };
    }, [editor, uploadImage]);

    const handleFileSelect = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
          await uploadImage(file);
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
      [uploadImage]
    );

    const toggleBold = useCallback(() => {
      if (!editor) return;
      editor.chain().focus().toggleBold().run();
    }, [editor]);

    const toggleItalic = useCallback(() => {
      if (!editor) return;
      editor.chain().focus().toggleItalic().run();
    }, [editor]);

    const toggleBulletList = useCallback(() => {
      if (!editor) return;
      editor.chain().focus().toggleBulletList().run();
    }, [editor]);

    const toggleOrderedList = useCallback(() => {
      if (!editor) return;
      editor.chain().focus().toggleOrderedList().run();
    }, [editor]);

    const toggleTaskList = useCallback(() => {
      if (!editor) return;
      editor.chain().focus().toggleTaskList().run();
    }, [editor]);

    const addImage = useCallback(() => {
      fileInputRef.current?.click();
    }, []);

    const addLink = useCallback(() => {
      if (!editor) return;
      const url = window.prompt("Enter URL:");
      if (url) {
        editor.chain().focus().setLink({ href: url }).run();
      }
    }, [editor]);

    if (!editor) {
      return null;
    }

    return (
      <div className={cn("border rounded-lg overflow-hidden", className)}>
        {editable && (
          <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleBold}
              className={cn(
                "h-9 w-9 p-0",
                editor.isActive("bold") && "bg-accent"
              )}
            >
              <Bold className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleItalic}
              className={cn(
                "h-9 w-9 p-0",
                editor.isActive("italic") && "bg-accent"
              )}
            >
              <Italic className="h-5 w-5" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleBulletList}
              className={cn(
                "h-9 w-9 p-0",
                editor.isActive("bulletList") && "bg-accent"
              )}
            >
              <List className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleOrderedList}
              className={cn(
                "h-9 w-9 p-0",
                editor.isActive("orderedList") && "bg-accent"
              )}
            >
              <ListOrdered className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleTaskList}
              className={cn(
                "h-9 w-9 p-0",
                editor.isActive("taskList") && "bg-accent"
              )}
            >
              <CheckSquare className="h-5 w-5" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addImage}
              disabled={isUploading}
              className="h-9 w-9 p-0"
            >
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ImageIcon className="h-5 w-5" />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addLink}
              className={cn(
                "h-9 w-9 p-0",
                editor.isActive("link") && "bg-accent"
              )}
            >
              <LinkIcon className="h-5 w-5" />
            </Button>
          </div>
        )}
        <EditorContent
          editor={editor}
          className={cn(
            "prose prose-sm max-w-none p-4 min-h-[120px] focus:outline-none",
            "[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[120px]",
            // Style dla task list
            "[&_ul[data-type='taskList']]:list-none [&_ul[data-type='taskList']]:pl-0",
            "[&_li[data-type='taskItem']]:flex [&_li[data-type='taskItem']]:items-start [&_li[data-type='taskItem']]:gap-2",
            "[&_li[data-type='taskItem']>label]:flex [&_li[data-type='taskItem']>label]:items-center [&_li[data-type='taskItem']>label]:pt-0.5",
            "[&_li[data-type='taskItem']>label>input[type='checkbox']]:m-0 [&_li[data-type='taskItem']>label>input[type='checkbox']]:w-4 [&_li[data-type='taskItem']>label>input[type='checkbox']]:h-4",
            "[&_li[data-type='taskItem']>div]:flex-1"
          )}
        />
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.value === nextProps.value &&
      prevProps.placeholder === nextProps.placeholder &&
      prevProps.className === nextProps.className &&
      prevProps.editable === nextProps.editable
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";