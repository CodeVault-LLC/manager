import { Mark, mergeAttributes, Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { attachClickMenu } from "./click-menu";

export const LanguageIssue = Mark.create({
  name: "languageIssue",

  addAttributes() {
    return {
      message: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-message") || "",
      },
      suggestions: {
        default: [],
        parseHTML: (el) =>
          JSON.parse(el.getAttribute("data-suggestions") || "[]"),
      },
      class: {
        default: "language-issue",
        parseHTML: (el) => el.className || "language-issue",
      },
      "data-issue": {
        default: true,
        parseHTML: (el) => el.getAttribute("data-issue") === "true",
      },
      "data-from": {
        default: 0,
        parseHTML: (el) => parseInt(el.getAttribute("data-from") || "0", 10),
      },
      "data-to": {
        default: 0,
        parseHTML: (el) => parseInt(el.getAttribute("data-to") || "0", 10),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-issue]",
        getAttrs: (el) => ({
          "data-message": el.getAttribute("data-message"),
          "data-suggestions": el.getAttribute("data-suggestions"),
          "data-from": el.getAttribute("data-from"),
          "data-to": el.getAttribute("data-to"),
          class: el.className || "language-issue",
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {};
  },
});

export const LanguageChecker = Extension.create({
  name: "languageChecker",

  addOptions() {
    return {
      enabled: true,
      checkOnUpdate: true,
      checkTypes: ["grammar", "typography"],
    };
  },

  addStorage() {
    return {
      lastCheckedText: "",
    };
  },

  addProseMirrorPlugins() {
    if (!this.options.enabled) return [];

    return [
      new Plugin({
        key: new PluginKey("languageCheckerPlugin"),
        view: (editorView) => {
          const checkText = async () => {
            const text = editorView.state.doc.textContent;

            if (text === this.storage.lastCheckedText) return;
            this.storage.lastCheckedText = text;

            const issues = await mockGrammarCheck(
              text,
              this.options.checkTypes
            );

            const { state, dispatch } = editorView;
            const tr = state.tr;

            issues.forEach((issue) => {
              const from = issue.offset;
              const to = from + issue.length;

              const markType = state.schema.marks.languageIssue;
              if (!markType) return;

              console.log(`Adding issue from ${from} to ${to}:`, issue);

              tr.addMark(
                from,
                to,
                markType.create({
                  message: issue.message,
                  suggestions: issue.replacements,
                })
              );
            });

            dispatch(tr);
          };

          // Run on initial load
          checkText();

          setTimeout(() => {
            const spans = editorView.dom.querySelectorAll("span[data-issue]");
            spans.forEach((el) => {
              if (el.getAttribute("data-has-menu") === "true") return;
              el.setAttribute("data-has-menu", "true");

              const from = parseInt(el.getAttribute("data-from") || "0", 10);
              const to = parseInt(el.getAttribute("data-to") || "0", 10);
              if (isNaN(from) || isNaN(to)) return;

              const message = el.getAttribute("data-message")!;
              const replacements = JSON.parse(
                el.getAttribute("data-suggestions")!
              );

              attachClickMenu(
                el as HTMLElement,
                { message, replacements },
                { from, to },
                editorView
              );
            });
          }, 50);

          return {
            update: () => {
              if (this.options.checkOnUpdate) {
                checkText();
              }
            },
            destroy: () => {},
          };
        },
      }),
    ];
  },
});

// Mock function for demonstration
async function mockGrammarCheck(text: string, checkTypes: string[]) {
  const issues: {
    offset: number;
    length: number;
    message: string;
    replacements: string[];
  }[] = [];

  if (checkTypes.includes("grammar") && text.includes("I has")) {
    issues.push({
      offset: text.indexOf("I has"),
      length: 5,
      message: "Incorrect verb usage. Use 'have'.",
      replacements: ["I have"],
    });
  }

  if (checkTypes.includes("typography") && text.includes("alot")) {
    issues.push({
      offset: text.indexOf("alot"),
      length: 4,
      message: "Consider using 'a lot'.",
      replacements: ["a lot"],
    });
  }

  return issues;
}
