import { createRoot } from "react-dom/client";
import { LanguageIssueMenu } from "./language-menu";

export const attachClickMenu = (
  el: HTMLElement,
  issue: any,
  fromTo: { from: number; to: number },
  editorView: any
) => {
  el.addEventListener("click", (event) => {
    event.stopPropagation();
    event.preventDefault();

    const container = document.createElement("div");
    const root = createRoot(container);

    root.render(
      <LanguageIssueMenu
        message={issue.message}
        suggestions={issue.replacements}
        onSelect={(sug: string) => {
          const { from, to } = fromTo;
          const tr = editorView.state.tr
            .insertText(sug, from, to)
            .removeMark(from, to, editorView.state.schema.marks.languageIssue);
          editorView.dispatch(tr);
        }}
      />
    );
  });
};
