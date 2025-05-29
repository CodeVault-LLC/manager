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
      <CardContent className="flex flex-wrap items-center justify-between py-3 px-4">
        {/* Font Controls */}
        <div className="flex items-center gap-2">
          <Select
            value={editor.getAttributes("textStyle").fontFamily}
            onValueChange={(value) =>
              editor.chain().focus().setFontFamily(value).run()
            }
          >
            <SelectTrigger>
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
            value={editor.getAttributes("textStyle").fontSize}
            onValueChange={(value) =>
              editor.chain().focus().setFontSize(value).run()
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Font Size" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="12px">Small</SelectItem>
              <SelectItem value="16px">Normal</SelectItem>
              <SelectItem value="20px">Large</SelectItem>
              <SelectItem value="28px">Huge</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Text Formatting */}
        <div className="flex items-center gap-1">
          <IconButton
            icon={<Bold />}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <IconButton
            icon={<Italic />}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <IconButton
            icon={<Underline />}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          />
          <IconButton
            icon={<Strikethrough />}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          />
        </div>

        {/* Headings + Paragraph */}
        <div className="flex items-center gap-1">
          <IconButton
            icon={<Pilcrow />}
            onClick={() => editor.chain().focus().setParagraph().run()}
          />
          <IconButton
            icon={<Heading1 />}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          />
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1">
          <IconButton
            icon={<List />}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <IconButton
            icon={<ListOrdered />}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1">
          <IconButton
            icon={<AlignLeft />}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          />
          <IconButton
            icon={<AlignCenter />}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          />
          <IconButton
            icon={<AlignRight />}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
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

const IconButton: FC<{
  icon: JSX.Element;
  onClick: () => void;
  disabled?: boolean;
}> = ({ icon, onClick, disabled }) => (
  <Button
    onClick={onClick}
    disabled={disabled}
    className={`p-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed`}
  >
    {icon}
  </Button>
);
