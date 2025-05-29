import { useCurrentEditor } from "@tiptap/react";
import { FC } from "react";
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
  Heading1,
  Pilcrow,
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
  if (!editor) return null;

  return (
    <Card className="border-b rounded-none shadow-none w-full">
      <CardContent className="flex flex-wrap items-center justify-between py-3 px-4 gap-3">
        {/* Font Controls */}
        <div className="flex items-center gap-2">
          <Select
            value={editor.getAttributes("textStyle").fontFamily}
            onValueChange={(value) =>
              editor.chain().focus().setFontFamily(value).run()
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Font Family" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="Inter">Inter</SelectItem>
              <SelectItem value="Georgia">Georgia</SelectItem>
              <SelectItem value="Courier New">Courier New</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={
              editor.getAttributes("textStyle").fontSize?.toString() || "p"
            }
            onValueChange={(value) => {
              const headings = ["h1", "h2", "h3"];
              if (headings.includes(value)) {
                editor
                  .chain()
                  .focus()
                  .setHeading({ level: parseInt(value[1]) })
                  .run();
              } else if (value === "p") {
                editor.chain().focus().setParagraph().run();
              }
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Font Size" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="h1">H1</SelectItem>
              <SelectItem value="h2">H2</SelectItem>
              <SelectItem value="h3">H3</SelectItem>
              <SelectItem value="p">Paragraph</SelectItem>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="tiny">Tiny</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Text Formatting */}
        <div className="flex items-center gap-1">
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
        </div>

        {/* Headings + Paragraph */}
        <div className="flex items-center gap-1">
          <IconButton
            icon={<Pilcrow />}
            onClick={() => editor.chain().focus().setParagraph().run()}
            active={editor.isActive("paragraph")}
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

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
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

// Reusable IconButton component
const IconButton: FC<{
  icon: JSX.Element;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}> = ({ icon, onClick, active, disabled }) => (
  <Button
    onClick={onClick}
    disabled={disabled}
    variant={active ? "secondary" : "ghost"}
    className={`p-2 rounded-md ${active ? "bg-muted text-foreground" : ""}`}
  >
    {icon}
  </Button>
);
