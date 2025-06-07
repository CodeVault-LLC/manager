import { useCurrentEditor } from "@tiptap/react";
import { FC, useMemo } from "react";
import { Card, CardContent } from "../../../ui/card";
import { Clock } from "lucide-react";

export const FooterBar: FC = () => {
  const { editor } = useCurrentEditor();

  const stats = useMemo(() => {
    if (!editor) return null;

    const fullText = editor.state.doc.textContent || "";
    const selection = editor.state.selection
      .content()
      .content.textBetween(0, editor.state.selection.content().size, " ", " ");

    const wordCount = fullText.trim().split(/\s+/).filter(Boolean).length;
    const charCount = fullText.length;
    const readingTime = Math.ceil(wordCount / 200); // avg. 200 wpm
    const pages = Math.max(1, Math.ceil(charCount / 1800)); // ~1800 chars/page A4

    const selectedWords = selection.trim().split(/\s+/).filter(Boolean).length;
    const selectedChars = selection.length;

    return {
      wordCount,
      charCount,
      readingTime,
      pages,
      selectedWords,
      selectedChars,
    };
  }, [editor?.state.doc.content, editor?.state.selection]);

  if (!editor || !stats) return null;

  return (
    <Card className="w-full border-t rounded-none shadow-none bg-background">
      <CardContent className="flex flex-wrap items-center justify-between text-xs text-muted-foreground py-3 px-4 gap-4">
        <div className="flex flex-wrap gap-6 items-center">
          <span>
            📝 <strong>{stats.wordCount}</strong> words
          </span>
          <span>
            🔡 <strong>{stats.charCount}</strong> characters
          </span>
          <span>
            📄 <strong>{stats.pages}</strong> page{stats.pages > 1 ? "s" : ""}
          </span>
          <span>
            ⏱ <strong>{stats.readingTime}</strong> min read
          </span>
          {stats.selectedChars > 0 && (
            <span className="text-muted-foreground/80">
              🔍 <strong>{stats.selectedWords}</strong> selected words /{" "}
              <strong>{stats.selectedChars}</strong> characters
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <Clock className="w-4 h-4" />
          <span>Last auto-saved just now</span>
        </div>
      </CardContent>
    </Card>
  );
};
