import { FC } from "react";
import { EditorProvider, Extensions } from "@tiptap/react";
import TextStyle from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Typography from "@tiptap/extension-typography";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";

import "./editor.css";
import { Topbar } from "./ui/topbar";
import { FooterBar } from "./ui/footer";
import { all, createLowlight } from "lowlight";
import StarterKit from "@tiptap/starter-kit";

interface EditorProps {
  value: object | null;
  onValueChange: (value: object | null) => void;
  onSave: () => void;
}

export const Editor: FC<EditorProps> = ({ value, onValueChange }) => {
  const lowlight = createLowlight(all);

  const extensions: Extensions = [
    TextStyle,
    FontFamily,
    Typography,
    TextAlign,
    Underline,
    CodeBlockLowlight.configure({
      lowlight,
    }),
    StarterKit,
  ];

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
              "border shadow-sm p-4 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[300px] max-h-[80vh] overflow-y-auto prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl dark:prose-invert",
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
