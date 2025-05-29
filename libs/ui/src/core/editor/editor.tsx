import { FC, useEffect } from "react";
import { EditorProvider, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import TextStyle from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Typography from "@tiptap/extension-typography";

import "./editor.css";
import { Topbar } from "./ui/topbar";
import { FooterBar } from "./ui/footer";

interface EditorProps {
  value: object | null;
  onValueChange: (value: object | null) => void;
  onSave: () => void;
}

export const Editor: FC<EditorProps> = ({ value, onValueChange, onSave }) => {
  const extensions = [StarterKit, TextStyle, FontFamily, Typography];

  if (!value) {
    return <div className="editor-container">No content available</div>;
  }

  return (
    <div className="flex w-full h-full flex-screen flex-col overflow-y-auto">
      <EditorProvider
        slotBefore={[<Topbar key="topbar" />]}
        slotAfter={[<FooterBar />]}
        extensions={extensions}
        editorProps={{
          attributes: {
            class:
              "border shadow-sm p-4 focus:outline-none focus:ring-1 focus:ring-blue-500",
          },
        }}
        content={value}
        onUpdate={({ editor }) => {
          const json = editor.getJSON();
          onValueChange(json);
        }}
      />
    </div>
  );
};
