"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { FC, useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";
import { Button } from "./Button";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

export const RichTextEditor: FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = "Enter description...",
  className,
  editable = true,
}) => {
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
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const generateUploadUrl = useAction(api.files.generateUploadUrl);
  const getImageUrl = useAction(api.files.getImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const uploadImage = useCallback(
    async (file: File) => {
      if (!editor) return;

      setIsUploading(true);
      try {
        // Generuj URL do uploadu
        const uploadUrl = await generateUploadUrl();

        // Upload pliku do Convex Storage
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        const { storageId } = await result.json();

        // Pobierz URL obrazu
        const imageUrl = await getImageUrl({ storageId });

        // Dodaj obraz do edytora
        if (imageUrl) {
          editor.chain().focus().setImage({ src: imageUrl }).run();
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        // Fallback: użyj base64 dla małych obrazów
        if (file.size < 1000000) {
          // < 1MB
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

    // Obsługa wklejania obrazów ze schowka
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

    // Obsługa drag & drop
    const handleDrop = async (e: DragEvent) => {
      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      e.preventDefault();
      const imageFile = Array.from(files).find(
        (file) => file.type.startsWith("image/")
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      await uploadImage(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!editor) {
    return null;
  }

  const addImage = () => {
    fileInputRef.current?.click();
  };

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {editable && (
        <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive("bold") && "bg-accent"
            )}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive("italic") && "bg-accent"
            )}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive("bulletList") && "bg-accent"
            )}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive("orderedList") && "bg-accent"
            )}
          >
            <ListOrdered className="h-4 w-4" />
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
            className="h-8 w-8 p-0"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addLink}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive("link") && "bg-accent"
            )}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
      <EditorContent
        editor={editor}
        className={cn(
          "prose prose-sm max-w-none p-4 min-h-[120px] focus:outline-none",
          "[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[120px]"
        )}
      />
    </div>
  );
};
