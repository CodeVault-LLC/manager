import { useCurrentEditor } from "@tiptap/react";
import { FC, useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2,
  Code,
  Highlighter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { Button } from "../../../ui/button";
import { Card, CardContent } from "../../../ui/card";

export const Topbar: FC = () => {
  const { editor } = useCurrentEditor();
  const [fontFamily, setFontFamily] = useState("Inter");
  const [blockType, setBlockType] = useState("paragraph");
  const [fontSize, setFontSize] = useState("16");

  useEffect(() => {
    if (!editor) return undefined;

    const updateState = () => {
      const attrs = editor.getAttributes("textStyle");
      const heading = editor.getAttributes("heading");
      const nodeType = editor.isActive("heading")
        ? `h${heading.level}`
        : editor.isActive("paragraph")
        ? "paragraph"
        : "paragraph";

      setFontFamily(attrs.fontFamily || "Inter");
      setFontSize(attrs.fontSize || "16");
      setBlockType(nodeType);
    };

    updateState();
    editor.on("selectionUpdate", updateState);

    return () => {
      editor.off("selectionUpdate", updateState);
    };
  }, [editor]);

  if (!editor) return null;

  return (
    <Card className="border-b rounded-none shadow-none w-full bg-background">
      <CardContent className="flex flex-wrap items-center justify-start gap-4 py-3 px-4">
        {/* Font family */}
        <Select
          value={fontFamily}
          onValueChange={(value) => {
            editor.chain().focus().setFontFamily(value).run();
            setFontFamily(value);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Font Family" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Inter">Inter</SelectItem>
            <SelectItem value="Georgia">Georgia</SelectItem>
            <SelectItem value="Courier New">Courier New</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
          </SelectContent>
        </Select>

        {/* Block Type */}
        <Select
          value={blockType}
          onValueChange={(value) => {
            if (value.startsWith("h")) {
              editor
                .chain()
                .focus()
                .setHeading({ level: parseInt(value[1]) as any })
                .run();
            } else {
              editor.chain().focus().setParagraph().run();
            }
            setBlockType(value);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Block Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="h1">Heading 1</SelectItem>
            <SelectItem value="h2">Heading 2</SelectItem>
            <SelectItem value="h3">Heading 3</SelectItem>
            <SelectItem value="paragraph">Paragraph</SelectItem>
          </SelectContent>
        </Select>

        {/* Font Size */}
        <Select
          value={fontSize}
          onValueChange={(value) => {
            editor
              .chain()
              .focus()
              .setMark("textStyle", { fontSize: value })
              .run();
            setFontSize(value);
          }}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12">12px</SelectItem>
            <SelectItem value="14">14px</SelectItem>
            <SelectItem value="16">16px</SelectItem>
            <SelectItem value="18">18px</SelectItem>
            <SelectItem value="24">24px</SelectItem>
            <SelectItem value="32">32px</SelectItem>
          </SelectContent>
        </Select>

        {/* Text Format Buttons */}
        <div className="flex items-center gap-1 ml-2">
          <IconButton
            icon={<Bold />}
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
          />
          <IconButton
            icon={<Italic />}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
          />
          <IconButton
            icon={<Underline />}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
          />
          <IconButton
            icon={<Strikethrough />}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
          />
          <IconButton
            icon={<Highlighter />}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            active={editor.isActive("highlight")}
          />
          <IconButton
            icon={<Code />}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive("codeBlock")}
          />
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1">
          <IconButton
            icon={<List />}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
          />
          <IconButton
            icon={<ListOrdered />}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
          />
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1">
          <IconButton
            icon={<AlignLeft />}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })}
          />
          <IconButton
            icon={<AlignCenter />}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })}
          />
          <IconButton
            icon={<AlignRight />}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            active={editor.isActive({ textAlign: "right" })}
          />
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-1 ml-auto">
          <IconButton
            icon={<Undo2 />}
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          />
          <IconButton
            icon={<Redo2 />}
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          />
        </div>
      </CardContent>
    </Card>
  );
};

const IconButton: FC<{
  icon: JSX.Element;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}> = ({ icon, onClick, active, disabled }) => (
  <Button
    onClick={onClick}
    disabled={disabled}
    variant={active ? "default" : "ghost"}
    className={`p-2 rounded-md ${active ? "bg-muted text-foreground" : ""}`}
  >
    {icon}
  </Button>
);
