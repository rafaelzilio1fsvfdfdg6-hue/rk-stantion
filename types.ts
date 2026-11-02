import React from 'react';

// VFS Types
export type VFSNode = VFSFile | VFSDirectory;

export interface VFSFile {
  type: 'file';
  name: string;
  content: string;
}

export interface VFSDirectory {
  type: 'directory';
  name: string;
  children: { [name: string]: VFSNode };
}


export interface AppDefinition {
  id: string;
  name: string;
  icon: React.ReactNode;
  component: React.FC<any>;
  opensFileTypes?: string[]; // To associate apps with file types e.g. ['.txt']
  category?: 'Core' | 'Utilities' | 'Entertainment' | 'Development' | 'Games';
  description?: string;
  isInstallable?: boolean;
  allowMultipleInstances?: boolean; // If false, focusing the app is preferred.
  pinned?: boolean; // If true, show in the pinned section of the Start Menu.
}

export interface TabInstance {
  id: string;
  app: AppDefinition;
  filePath?: string; // To open a specific file or directory
  title?: string; // Optional override for tab title
}

export interface WindowInstance {
  id:number;
  tabs: TabInstance[];
  activeTabId: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  lastPosition: { x: number; y: number };
  lastSize: { width: number; height: number };
}

// For Context Menu
export interface ContextMenuItem {
    label: string;
    action: () => void;
    separator?: boolean;
    icon?: React.ReactNode;
}

// For Trash / Recycle Bin
export interface TrashItem {
    id: string;
    originalPath: string;
    name: string;
    deletedAt: number;
    node: VFSNode;
}

// For Notifications
export interface NotificationItem {
    id: number;
    title: string;
    message: string;
}

// For Command Bar
export interface CommandResult {
    id: string;
    type: 'app' | 'file' | 'directory' | 'action' | 'answer' | 'info';
    title: string;
    description: string;
    icon: React.ReactNode;
    action: () => void;
    sources?: {uri: string, title: string}[];
}

// For Synapse Messenger App
export interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
    timestamp: number;
}

export interface Contact {
    id: string;
    name: string;
    avatar: React.ReactNode;
    personality: string;
}

// For Matrix-Tube
export interface Video {
    title: string;
    channel: string;
    views: string;
    uploadDate: string;
    description: string;
    embedId: string;
}

// For Live TV App
export interface TVChannel {
    id: string;
    name: string;
    description: string;
    currentProgram: string;
    videoEmbedId: string;
}

// For Radio App
export interface RadioStation {
    id: string;
    name: string;
    genre: string;
    description: string;
    audioStreamUrl: string; // youtube embed id
}
