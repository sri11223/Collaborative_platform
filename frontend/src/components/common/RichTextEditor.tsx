import React from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Code, Link2, List, ListOrdered, Quote, Undo2, Redo2,
} from 'lucide-react';

// ==================== Toolbar Button ====================
const ToolbarButton: React.FC<{
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
  compact?: boolean;
}> = ({ onClick, active, title, children, compact }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`${compact ? 'p-1' : 'p-1.5'} rounded transition-colors ${
      active
        ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400'
        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200'
    }`}
  >
    {children}
  </button>
);

// ==================== Menu Bar ====================
const MenuBar: React.FC<{ editor: Editor | null; compact?: boolean }> = ({ editor, compact }) => {
  if (!editor) return null;

  const iconSize = compact ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const divider = <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-0.5" />;

  return (
    <div className="flex items-center gap-0.5 flex-wrap">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="Bold (Ctrl+B)"
        compact={compact}
      >
        <Bold className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="Italic (Ctrl+I)"
        compact={compact}
      >
        <Italic className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
        title="Underline (Ctrl+U)"
        compact={compact}
      >
        <UnderlineIcon className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
        title="Strikethrough"
        compact={compact}
      >
        <Strikethrough className={iconSize} />
      </ToolbarButton>

      {divider}

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive('code')}
        title="Inline Code"
        compact={compact}
      >
        <Code className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          const url = window.prompt('Enter URL:');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        active={editor.isActive('link')}
        title="Add Link"
        compact={compact}
      >
        <Link2 className={iconSize} />
      </ToolbarButton>

      {divider}

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="Bullet List"
        compact={compact}
      >
        <List className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="Numbered List"
        compact={compact}
      >
        <ListOrdered className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        title="Quote"
        compact={compact}
      >
        <Quote className={iconSize} />
      </ToolbarButton>

      {!compact && (
        <>
          {divider}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo"
          >
            <Undo2 className={iconSize} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo"
          >
            <Redo2 className={iconSize} />
          </ToolbarButton>
        </>
      )}
    </div>
  );
};

// ==================== Rich Text Editor ====================
interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  compact?: boolean;
  editable?: boolean;
  className?: string;
  minHeight?: string;
  onSubmit?: () => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start typing...',
  compact = false,
  editable = true,
  className = '',
  minHeight = '120px',
  onSubmit,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: { HTMLAttributes: { class: 'bg-gray-100 dark:bg-gray-800 rounded-lg p-3 my-2 text-sm font-mono' } },
        blockquote: { HTMLAttributes: { class: 'border-l-3 border-primary-400 pl-3 italic text-gray-500 dark:text-gray-400 my-2' } },
        bulletList: { HTMLAttributes: { class: 'list-disc ml-4 space-y-1' } },
        orderedList: { HTMLAttributes: { class: 'list-decimal ml-4 space-y-1' } },
        code: { HTMLAttributes: { class: 'bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs font-mono text-pink-600 dark:text-pink-400' } },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-500 hover:text-primary-600 underline cursor-pointer',
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm dark:prose-invert max-w-none focus:outline-none ${
          compact ? 'text-sm' : 'text-sm'
        }`,
        style: `min-height: ${minHeight}`,
      },
      handleKeyDown: (_view, event) => {
        if (event.key === 'Enter' && !event.shiftKey && compact && onSubmit) {
          event.preventDefault();
          onSubmit();
          return true;
        }
        return false;
      },
    },
  });

  // Update content when it changes externally
  React.useEffect(() => {
    if (editor && content !== editor.getHTML() && !editor.isFocused) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editable) {
    return (
      <div
        className={`prose prose-sm dark:prose-invert max-w-none ${className}`}
        dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-400 italic">No content</p>' }}
      />
    );
  }

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${className}`}>
      <div className={`${compact ? 'px-2 py-1' : 'px-3 py-1.5'} bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700`}>
        <MenuBar editor={editor} compact={compact} />
      </div>
      <div className={`${compact ? 'px-3 py-2' : 'px-4 py-3'} bg-white dark:bg-gray-800/50`}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

// ==================== Read-only Renderer ====================
export const RichTextDisplay: React.FC<{ content: string; className?: string }> = ({
  content,
  className = '',
}) => {
  if (!content || content === '<p></p>') {
    return null;
  }

  return (
    <div
      className={`prose prose-sm dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
