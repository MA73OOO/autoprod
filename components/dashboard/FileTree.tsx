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
}

export default function FileTree({ node, level = 0, onAddNode }: FileTreeProps) {
  const [isOpen, setIsOpen] = useState(level < 1); // Auto-open root level
  const isDir = node.type === 'directory';

  return (
    <div className="text-sm">
      <div 
        className={`flex items-center group py-1 px-2 rounded cursor-pointer hover:bg-zinc-800/50 transition-colors ${level === 0 ? 'font-semibold text-zinc-200' : 'text-zinc-400'}`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => isDir && setIsOpen(!isOpen)}
      >
        <span className="w-4 inline-block opacity-70">
          {isDir ? (isOpen ? '▼' : '▶') : '📄'}
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
              <FileTree key={i} node={child} level={level + 1} onAddNode={onAddNode} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
