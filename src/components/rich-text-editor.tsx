'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Dropcursor from '@tiptap/extension-dropcursor';
import { useState, useCallback, useRef, useEffect } from 'react';
import {
  FormattingToolbar,
  type FormatType,
  type AiActionType,
} from './formatting-toolbar';
import { uploadImage } from '@/app/(app)/notes/actions';
import { Plugin, PluginKey } from 'prosemirror-state';

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

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const url = await uploadImage(formData);
    return url;
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
      Image.configure({
        allowBase64: true,
      }),
      Dropcursor,
      new Plugin({
        key: new PluginKey('handle-drag'),
        props: {
            handleDOMEvents: {
                dragenter: (view, event) => {
                    if (event.dataTransfer?.files.length) {
                       view.dom.classList.add('is-dragging');
                    }
                    return false;
                },
                dragleave: (view, event) => {
                    view.dom.classList.remove('is-dragging');
                    return false;
                },
                drop: (view, event) => {
                    view.dom.classList.remove('is-dragging');
                    return false;
                }
            }
        }
      })
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
        top: Math.max(box.top - 60, 10), 
        left: box.left,
      });
    },
    onBlur: () => {
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
      handleDrop: function(view, event, slice, moved) {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            
            handleImageUpload(file).then(url => {
              if (url) {
                const { schema } = view.state;
                const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                if (!coordinates) return;
                const node = schema.nodes.image.create({ src: url });
                const transaction = view.state.tr.insert(coordinates.pos, node);
                view.dispatch(transaction);
              }
            });
            return true;
          }
        }
        return false;
      },
      handlePaste: function(view, event, slice) {
        const items = Array.from(event.clipboardData?.items || []);
        const file = items.find(item => item.type.startsWith('image/'))?.getAsFile();

        if (file) {
          event.preventDefault();
          handleImageUpload(file).then(url => {
            if (url) {
              const { schema } = view.state;
              const node = schema.nodes.image.create({ src: url });
              const transaction = view.state.tr.replaceSelectionWith(node);
              view.dispatch(transaction);
            }
          });
          return true;
        }
        return false;
      }
    },
  });

  useEffect(() => {
    if (editor) {
      const isSame = editor.getHTML() === content;
      if (!isSame) {
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
