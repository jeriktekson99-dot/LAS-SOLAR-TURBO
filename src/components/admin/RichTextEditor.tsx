import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Link as LinkIcon, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Minus,
  Undo,
  Redo
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

// Keep extensions statically outside the component to bypass duplicate initialization on hot-mounts
const staticExtensions = [
  StarterKit.configure(),
  Underline.configure(),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'text-app-purple underline font-bold',
    },
  }),
];

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const handleApplyLink = () => {
    if (linkUrl.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      let formattedUrl = linkUrl.trim();
      // Auto prepend https:// if missing a standard protocol/prefix
      if (!/^https?:\/\//i.test(formattedUrl) && !/^mailto:/i.test(formattedUrl) && !/^tel:/i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
      }
      editor.chain().focus().extendMarkRange('link').setLink({ href: formattedUrl }).run();
    }
    setShowLinkInput(false);
  };

  const handleRemoveLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setShowLinkInput(false);
  };

  const handleLinkButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setShowLinkInput(true);
  };

  const buttons = [
    {
      icon: Bold,
      title: 'Bold',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold'),
    },
    {
      icon: Italic,
      title: 'Italic',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic'),
    },
    {
      icon: UnderlineIcon,
      title: 'Underline',
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: () => editor.isActive('underline'),
    },
    {
      icon: Heading2,
      title: 'H2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive('heading', { level: 2 }),
    },
    {
      icon: Heading3,
      title: 'H3',
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: () => editor.isActive('heading', { level: 3 }),
    },
    {
      icon: List,
      title: 'Bullet List',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive('bulletList'),
    },
    {
      icon: ListOrdered,
      title: 'Ordered List',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive('orderedList'),
    },
    {
      icon: Quote,
      title: 'Blockquote',
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editor.isActive('blockquote'),
    },
    {
      icon: Minus,
      title: 'Divider',
      action: () => editor.chain().focus().setHorizontalRule().run(),
      isActive: () => false,
    },
    {
      icon: LinkIcon,
      title: 'Link',
      action: () => {}, // Handled separately via handleLinkButtonClick
      isActive: () => editor.isActive('link'),
    },
  ];

  return (
    <div className="flex flex-col border-b border-slate-200 bg-slate-50">
      <div className="flex flex-wrap gap-1 p-2">
        {buttons.map((btn, i) => (
          <button
            key={i}
            type="button"
            onMouseDown={(e) => {
              // Vital safety: prevent default to avoid blurring editor and losing the cursor selection range
              e.preventDefault();
            }}
            onClick={(e) => {
              e.preventDefault();
              if (btn.title === 'Link') {
                handleLinkButtonClick(e);
              } else {
                btn.action();
              }
            }}
            className={`p-2 rounded-lg transition-all ${
              btn.isActive() 
                ? 'bg-app-purple text-white' 
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
            }`}
            title={btn.title}
          >
            <btn.icon size={18} />
          </button>
        ))}
        <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().undo().run();
          }}
          disabled={!editor.can().chain().focus().undo().run()}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30"
          title="Undo"
        >
          <Undo size={18} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().redo().run();
          }}
          disabled={!editor.can().chain().focus().redo().run()}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30"
          title="Redo"
        >
          <Redo size={18} />
        </button>
      </div>

      {showLinkInput && (
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-t border-slate-200 bg-slate-100/60 animation-fade-in animate-in fade-in duration-200">
          <span className="text-xs font-semibold text-slate-500 animate-none">Insert Link:</span>
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="example.com"
            className="px-2 py-1 text-xs border border-slate-300 rounded-md bg-white text-black focus:outline-none focus:border-app-purple w-48 sm:w-72 shadow-sm animate-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleApplyLink();
              } else if (e.key === 'Escape') {
                setShowLinkInput(false);
              }
            }}
            autoFocus
          />
          <button
            type="button"
            onClick={handleApplyLink}
            className="px-2.5 py-1 text-xs bg-app-purple text-white rounded-md hover:bg-opacity-95 font-medium transition-colors cursor-pointer animate-none"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={handleRemoveLink}
            className="px-2.5 py-1 text-xs bg-rose-500 text-white rounded-md hover:bg-rose-600 font-medium transition-colors cursor-pointer animate-none"
          >
            Remove Link
          </button>
          <button
            type="button"
            onClick={() => setShowLinkInput(false)}
            className="px-2.5 py-1 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md font-medium transition-colors cursor-pointer animate-none"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: staticExtensions,
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none',
      },
      transformPastedText(text) {
        // Clean up carriage returns, and collapse multiple blank lines into a single newline to prevent skipped lines
        return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n\n+/g, '\n');
      },
      transformPastedHTML(html) {
        // Filter out empty paragraph components or empty inline wraps to make spacing clean on paste
        const cleanHtml = html
          .replace(/<p>\s*<\/p>/gi, '')
          .replace(/<p><br\s*\/?>\s*<\/p>/gi, '')
          .replace(/<p>&nbsp;<\/p>/gi, '');

        // If the HTML consists of a single wrapped paragraph, unwrap it.
        // This prevents ProseMirror from splitting the destination paragraph block and skipping lines
        // when pasting shorter inline text segments copied within this same editor.
        const bodyContent = cleanHtml.replace(/<meta[^>]*>/gi, '').trim();
        const pMatch = bodyContent.match(/^<p[^>]*>([\s\S]*)<\/p>$/i);
        if (pMatch) {
          const innerContent = pMatch[1];
          // Check if there are any other block level tags inside
          const hasBlockTags = /<(p|h1|h2|h3|h4|h5|h6|ul|ol|li|blockquote|hr)\b[^>]*>/i.test(innerContent);
          if (!hasBlockTags) {
            return innerContent;
          }
        }
        return cleanHtml;
      }
    },
  });

  // Keep editor content in sync with external changes, but avoid resetting while typing
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="w-full rounded-xl border border-slate-200 overflow-hidden focus-within:border-black transition-all">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
