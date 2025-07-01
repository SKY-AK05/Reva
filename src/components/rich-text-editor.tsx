
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useState, useCallback, useRef, useEffect } from 'react';
import {
  FormattingToolbar,
  type FormatType,
  type AiActionType,
} from './formatting-toolbar';

interface RichTextEditorProps {
  content: string;
  onChange: (richText: string) => void;
  onAiAction: (selectedText: string) => void;
}

const RichTextEditor = ({
  content,
  onChange,
  onAiAction,
}: RichTextEditorProps) => {
  const [toolbarState, setToolbarState] = useState({
    show: false,
    top: 0,
    left: 0,
  });
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate({ editor }) {
      const { empty, from } = editor.state.selection;

      if (empty) {
        if (toolbarState.show) {
          setToolbarState((s) => ({ ...s, show: false }));
        }
        return;
      }

      const editorBounds = editorContainerRef.current?.getBoundingClientRect();
      if (!editorBounds) return;

      const start = editor.view.coordsAtPos(from);
      
      const box = {
        top: start.top - editorBounds.top,
        left: start.left - editorBounds.left,
      };
      
      setToolbarState({
        show: true,
        // Position toolbar 50px above the selection
        // And make sure it doesn't go above the editor container
        top: Math.max(box.top - 50, 10), 
        left: box.left,
      });
    },
    onBlur: () => {
      // Use a short delay to allow clicks on the toolbar
      // The onMouseDown handler in the toolbar should prevent the blur, but this is a fallback.
      setTimeout(() => {
        if (!editor?.isFocused) {
          setToolbarState((s) => ({...s, show: false}))
        }
      }, 150);
    },
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert max-w-none focus:outline-none w-full min-h-[10rem]',
      },
    },
  });

  useEffect(() => {
    if (editor) {
      // If the external content is different from the editor's content, update the editor.
      const isSame = editor.getHTML() === content;
      if (!isSame) {
        // The `false` argument prevents the onUpdate callback from firing, avoiding an infinite loop.
        editor.commands.setContent(content, false);
      }
    }
  }, [content, editor]);

  const handleFormat = useCallback(
    (formatType: FormatType) => {
      if (!editor) return;
      const chain = editor.chain().focus();
      switch (formatType) {
        case 'bold':
          chain.toggleBold().run();
          break;
        case 'italic':
          chain.toggleItalic().run();
          break;
        case 'strikethrough':
          chain.toggleStrike().run();
          break;
        case 'code':
          chain.toggleCode().run();
          break;
        case 'h1':
          chain.toggleHeading({ level: 1 }).run();
          break;
        case 'h2':
          chain.toggleHeading({ level: 2 }).run();
          break;
        case 'bulletList':
          chain.toggleBulletList().run();
          break;
        case 'orderedList':
          chain.toggleOrderedList().run();
          break;
        case 'blockquote':
          chain.toggleBlockquote().run();
          break;
      }
    },
    [editor]
  );

  const handleAiActionWrapper = useCallback(
    (actionType: AiActionType) => {
      if (!editor || actionType !== 'generateChart') return;
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to);
      if (selectedText) {
        onAiAction(selectedText);
      }
      // Hide the toolbar after action
      setToolbarState((s) => ({...s, show: false}));
    },
    [editor, onAiAction]
  );

  return (
    <div
      ref={editorContainerRef}
      className="relative"
    >
      {editor && toolbarState.show && (
        <FormattingToolbar
          onFormat={handleFormat}
          onAiAction={handleAiActionWrapper}
          style={{
            top: `${toolbarState.top}px`,
            left: `${toolbarState.left}px`,
          }}
        />
      )}
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
