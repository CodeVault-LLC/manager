// components/editor/ui/footer.tsx

import { useCurrentEditor } from "@tiptap/react";
import { FC, useMemo } from "react";
import { Card, CardContent } from "../../../ui/card";

export const FooterBar: FC = () => {
  const { editor } = useCurrentEditor();

  const stats = useMemo(() => {
    if (!editor) return { words: 0, characters: 0, readingTime: 0 };

    const text = editor.state.doc.textContent || "";
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const characters = text.length;
    const readingTime = Math.ceil(words / 200); // 200 wpm average

    return { words, characters, readingTime };
  }, [editor?.state.doc.content]);

  return (
    <Card className="w-full border-t rounded-none shadow-none">
      <CardContent className="flex items-center justify-between text-sm text-muted-foreground py-3 px-4">
        <div className="flex gap-6">
          <span>📝 {stats.words} words</span>
          <span>🔡 {stats.characters} chars</span>
          <span>⏱ {stats.readingTime} min read</span>
        </div>
        <div className="text-xs text-gray-400">Last auto-saved just now</div>
      </CardContent>
    </Card>
  );
};
