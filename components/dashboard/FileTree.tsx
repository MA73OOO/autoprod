'use client';

import { useState } from 'react';

export type FileNode = {
  name: string;
  path: string;
  type: 'directory' | 'file';
  children?: FileNode[];
};

interface FileTreeProps {
  node: FileNode;
  level?: number;
  onAddNode?: (parentPath: string, type: 'channel' | 'video') => void;
  onOpenFile?: (path: string) => void;
}

export default function FileTree({ node, level = 0, onAddNode, onOpenFile }: FileTreeProps) {
  const [isOpen, setIsOpen] = useState(false); // All folders closed by default
  const isDir = node.type === 'directory';
  const nameLower = node.name.toLowerCase();
  const isMarkdown = !isDir && (nameLower.endsWith('.md') || nameLower.endsWith('.txt'));
  const isImage = !isDir && (nameLower.endsWith('.png') || nameLower.endsWith('.jpg') || nameLower.endsWith('.jpeg') || nameLower.endsWith('.webp') || nameLower.endsWith('.gif'));
  const isPreviewable = isMarkdown || isImage;

  return (
    <div className="text-sm">
      <div 
        className={`flex items-center group py-1 px-2 rounded ${isPreviewable ? 'cursor-pointer hover:bg-zinc-800/80 hover:text-indigo-400' : isDir ? 'cursor-pointer hover:bg-zinc-800/50' : 'cursor-default'} transition-colors ${level === 0 ? 'font-semibold text-zinc-200' : 'text-zinc-400'}`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => {
          if (isDir) setIsOpen(!isOpen);
          else if (isPreviewable && onOpenFile) onOpenFile(node.path);
        }}
      >
        <span className="w-4 inline-block opacity-70 text-[10px]">
          {isDir ? (isOpen ? '▼' : '▶') : isMarkdown ? '📝' : isImage ? '🖼️' : '📄'}
        </span>
        <span className="ml-1 truncate flex-1">{node.name}</span>
        
        {/* Only show + on directories at level 0 (Channels) to create videos */}
        {isDir && onAddNode && level === 0 && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAddNode(node.path, 'video');
            }}
            className="opacity-50 group-hover:opacity-100 px-1.5 py-0.5 rounded bg-zinc-700 hover:bg-indigo-600 text-white text-[10px] transition-all"
            title="Añadir Video"
          >
            + Añadir
          </button>
        )}
      </div>

      {isOpen && isDir && node.children && (
        <div className="flex flex-col">
          {node.children.length === 0 ? (
            <div 
              className="text-xs text-zinc-600 italic py-1"
              style={{ paddingLeft: `${(level + 1) * 12 + 28}px` }}
            >
              Carpeta vacía
            </div>
          ) : (
            node.children.map((child, i) => (
              <FileTree key={i} node={child} level={level + 1} onAddNode={onAddNode} onOpenFile={onOpenFile} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
