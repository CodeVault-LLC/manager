import type { Value } from "@udecode/plate";

import {
  type CreatePlateEditorOptions,
  ParagraphPlugin,
  PlateLeaf,
  usePlateEditor,
} from "@udecode/plate/react";

import { withPlaceholders } from "./ui/placeholder";
//import { copilotPlugins } from "./plugins/copilot-plugins";
import { editorPlugins } from "./plugins/editor-plugins";
import { FixedToolbarPlugin } from "./plugins/fixed-toolbar-plugin";
import { FloatingToolbarPlugin } from "./plugins/floating-toolbar-plugin";
//import { AILeaf } from "./ui/ai-leaf";
//import { CalloutElement } from "./ui/callout-element";
/*import { CodeBlockElement } from "./ui/code-block-element";
import { CodeLeaf } from "./ui/code-leaf";
import { CodeLineElement } from "./ui/code-line-element";
import { CodeSyntaxLeaf } from "./ui/code-syntax-leaf";
import { ColumnElement } from "./ui/column-element";
import { ColumnGroupElement } from "./ui/column-group-element";
import { CommentLeaf } from "./ui/comment-leaf";
import { DateElement } from "./ui/date-element";
import { EmojiInputElement } from "./ui/emoji-input-element";
import { EquationElement } from "./ui/equation-element";
import { ExcalidrawElement } from "./ui/excalidraw-element";
import { HeadingElement } from "./ui/heading-element";
import { HighlightLeaf } from "./ui/highlight-leaf";
import { HrElement } from "./ui/hr-element";
import { ImageElement } from "./ui/image-element";
import { InlineEquationElement } from "./ui/inline-equation-element";
import { KbdLeaf } from "./ui/kbd-leaf";
import { LinkElement } from "./ui/link-element";
import { MediaAudioElement } from "./ui/media-audio-element";
import { MediaEmbedElement } from "./ui/media-embed-element";
import { MediaFileElement } from "./ui/media-file-element";
import { MediaPlaceholderElement } from "./ui/media-placeholder-element";
import { MediaVideoElement } from "./ui/media-video-element";
import { MentionElement } from "./ui/mention-element";
import { MentionInputElement } from "./ui/mention-input-element";
import { ParagraphElement } from "./ui/paragraph-element";

import { SlashInputElement } from "./ui/slash-input-element";
import { SuggestionLeaf } from "./ui/suggestion-leaf";
import {
  TableCellElement,
  TableCellHeaderElement,
} from "./ui/table-cell-element";
import { TableElement } from "./ui/table-element";
import { TableRowElement } from "./ui/table-row-element";
import { TocElement } from "./ui/toc-element";
import { ToggleElement } from "./ui/toggle-element";*/

export const viewComponents = {
  //[AudioPlugin.key]: MediaAudioElement,
  /*[BlockquotePlugin.key]: BlockquoteElement,
  [BoldPlugin.key]: withProps(PlateLeaf, { as: "strong" }),
  /*[CalloutPlugin.key]: CalloutElement,
  [CodeBlockPlugin.key]: CodeBlockElement,
  [CodeLinePlugin.key]: CodeLineElement,
  [CodePlugin.key]: CodeLeaf,
  [CodeSyntaxPlugin.key]: CodeSyntaxLeaf,
  [ColumnItemPlugin.key]: ColumnElement,
  [ColumnPlugin.key]: ColumnGroupElement,
  [CommentsPlugin.key]: CommentLeaf,
  [DatePlugin.key]: DateElement,
  [EquationPlugin.key]: EquationElement,
  //[ExcalidrawPlugin.key]: ExcalidrawElement,
  /* [FilePlugin.key]: MediaFileElement,
  [HEADING_KEYS.h1]: withProps(HeadingElement, { variant: "h1" }),
  [HEADING_KEYS.h2]: withProps(HeadingElement, { variant: "h2" }),
  [HEADING_KEYS.h3]: withProps(HeadingElement, { variant: "h3" }),
  [HEADING_KEYS.h4]: withProps(HeadingElement, { variant: "h4" }),
  [HEADING_KEYS.h5]: withProps(HeadingElement, { variant: "h5" }),
  [HEADING_KEYS.h6]: withProps(HeadingElement, { variant: "h6" }),
  [HighlightPlugin.key]: HighlightLeaf,
  [HorizontalRulePlugin.key]: HrElement,
  [ImagePlugin.key]: ImageElement,
  [InlineEquationPlugin.key]: InlineEquationElement,
  [ItalicPlugin.key]: withProps(PlateLeaf, { as: "em" }),
  //[KbdPlugin.key]: KbdLeaf,
  /*[LinkPlugin.key]: LinkElement,
  [MediaEmbedPlugin.key]: MediaEmbedElement,
  [MentionPlugin.key]: MentionElement,
  [ParagraphPlugin.key]: ParagraphElement,
  [PlaceholderPlugin.key]: MediaPlaceholderElement,
  [StrikethroughPlugin.key]: withProps(PlateLeaf, { as: "s" }),
  [SubscriptPlugin.key]: withProps(PlateLeaf, { as: "sub" }),
  //[SuggestionPlugin.key]: SuggestionLeaf,
  [SuperscriptPlugin.key]: withProps(PlateLeaf, { as: "sup" }),
  /*[TableCellHeaderPlugin.key]: TableCellHeaderElement,
  [TableCellPlugin.key]: TableCellElement,
  [TablePlugin.key]: TableElement,
  [TableRowPlugin.key]: TableRowElement,
  [TocPlugin.key]: TocElement,
  [TogglePlugin.key]: ToggleElement,
  [UnderlinePlugin.key]: withProps(PlateLeaf, { as: "u" }),
  [VideoPlugin.key]: MediaVideoElement,*/
};

export const editorComponents = {
  ...viewComponents,
  //[AIPlugin.key]: AILeaf,
  //[EmojiInputPlugin.key]: EmojiInputElement,
  //[MentionInputPlugin.key]: MentionInputElement,
  //[SlashInputPlugin.key]: SlashInputElement,
};

export const useCreateEditor = (
  {
    components,
    override,
    placeholders,
    readOnly,
    ...options
  }: {
    components?: Record<string, any>;
    placeholders?: boolean;
    plugins?: any[];
    readOnly?: boolean;
  } & Omit<CreatePlateEditorOptions, "plugins"> = {},
  deps: any[] = []
) => {
  return usePlateEditor<Value, (typeof editorPlugins)[number]>(
    {
      override: {
        components: {
          ...(readOnly
            ? viewComponents
            : placeholders
            ? withPlaceholders(editorComponents)
            : editorComponents),
          ...components,
        },
        ...override,
      },
      plugins: [
        //...copilotPlugins,
        ...editorPlugins,
        //FixedToolbarPlugin,
        //FloatingToolbarPlugin,
      ],
      value: [
        {
          children: [{ text: "Playground" }],
          type: "h1",
        },
        {
          children: [
            { text: "A rich-text editor with AI capabilities. Try the " },
            { bold: true, text: "AI commands" },
            { text: " or use " },
            { kbd: true, text: "Cmd+J" },
            { text: " to open the AI menu." },
          ],
          type: ParagraphPlugin.key,
        },
      ],
      ...options,
    },
    deps
  );
};
