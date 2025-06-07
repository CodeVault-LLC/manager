/* eslint-disable import/no-named-as-default */

import { FC } from "react";
import { EditorProvider, Extensions } from "@tiptap/react";
import TextStyle from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Typography from "@tiptap/extension-typography";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";

import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";

import "./editor.css";
import { Topbar } from "./ui/topbar";
import { FooterBar } from "./ui/footer";
import { all, createLowlight } from "lowlight";
import StarterKit from "@tiptap/starter-kit";
import { FontSize } from "./extensions/FontSize";

interface EditorProps {
  value: object | null;
  onValueChange: (value: object | null) => void;
  onSave: () => void;
}

export const Editor: FC<EditorProps> = ({ value, onValueChange }) => {
  const lowlight = createLowlight(all);

  const extensions: Extensions = [
    StarterKit,
    TextStyle,
    FontFamily,
    FontSize,
    Typography,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Underline,
    Highlight,
    Color,
    Subscript,
    Superscript,
    CodeBlockLowlight.configure({ lowlight }),
    Placeholder.configure({
      placeholder: "Start typing...",
    }),
    Table.configure({ resizable: true }),
    TableRow,
    TableCell,
    TableHeader,
  ];

  if (!value) {
    return <div className="editor-container">No content available</div>;
  }

  return (
    <div className="flex w-full h-full flex-screen flex-col overflow-y-auto">
      <EditorProvider
        immediatelyRender={true}
        shouldRerenderOnTransaction={false}
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
