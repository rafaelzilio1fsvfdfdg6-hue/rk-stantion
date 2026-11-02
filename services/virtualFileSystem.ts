import { VFSNode, VFSDirectory, VFSFile, TrashItem } from '../types';

const VFS_STORAGE_KEY = 'rkstation_vfs';
const VFS_TRASH_KEY = 'widons_vfs_trash';

const defaultFileSystem: VFSDirectory = {
  type: 'directory',
  name: '/',
  children: {
    home: {
      type: 'directory',
      name: 'home',
      children: {
        user: {
            type: 'directory',
            name: 'user',
            children: {
                Desktop: { type: 'directory', name: 'Desktop', children: {
                    'LEIAME.txt': { type: 'file', name: 'LEIAME.txt', content: 'Bem-vindo ao Widons 2.0!\n\nNovidades:\n- Lixeira integrada para recuperação de arquivos\n- Google Chrome com download direto para o sistema e PC\n- Interface aprimorada Widons 2.0'}
                } },
                Documents: { type: 'directory', name: 'Documents', children: {} },
                Downloads: { type: 'directory', name: 'Downloads', children: {
                    'Chrome_BemVindo.txt': { type: 'file', name: 'Chrome_BemVindo.txt', content: 'Seus downloads do Google Chrome no Widons 2.0 serão salvos aqui nesta pasta Downloads.' }
                } },
            }
        }
      },
    },
  },
};

const initializeFileSystem = (): VFSDirectory => {
  try {
    const savedFS = localStorage.getItem(VFS_STORAGE_KEY);
    if (savedFS) {
      const parsed: VFSDirectory = JSON.parse(savedFS);
      // Ensure /home/user/Downloads exists
      if (parsed.children?.home?.type === 'directory') {
        const home = parsed.children.home as VFSDirectory;
        if (home.children?.user?.type === 'directory') {
          const user = home.children.user as VFSDirectory;
          if (!user.children.Downloads) {
            user.children.Downloads = { type: 'directory', name: 'Downloads', children: {} };
          }
          if (!user.children.Desktop) {
            user.children.Desktop = { type: 'directory', name: 'Desktop', children: {} };
          }
        }
      }
      return parsed;
    }
  } catch (e) {
    console.error("Failed to parse VFS from localStorage:", e);
  }
  // Return a deep copy to prevent mutation of the default object
  return JSON.parse(JSON.stringify(defaultFileSystem));
};

// Initialize on module load to prevent race conditions
let fs: VFSDirectory = initializeFileSystem();

function saveFileSystem() {
  try {
    localStorage.setItem(VFS_STORAGE_KEY, JSON.stringify(fs));
  } catch (e) {
    console.error("Failed to save VFS:", e);
  }
}

export function initialize(): VFSDirectory {
  fs = initializeFileSystem();
  return fs;
}

export function getFileSystem(): VFSDirectory {
    return JSON.parse(JSON.stringify(fs));
}

function traverse(path: string): { parent: VFSDirectory | null, node: VFSNode | null, name: string } {
    const parts = path.split('/').filter(p => p);
    let current: VFSNode = fs;
    let parent: VFSDirectory | null = null;

    if (path === '/') return { parent: null, node: fs, name: '/'};

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (current.type !== 'directory' || !current.children[part]) {
            // Traverse up to the parent of the non-existent node
            const parentPath = '/' + parts.slice(0, i).join('/');
            const { node: foundParent } = traverse(parentPath);
            return { parent: foundParent as VFSDirectory, node: null, name: part };
        }
        parent = current;
        current = current.children[part];
    }
    return { parent, node: current, name: parts[parts.length - 1] };
}


export function getNode(path: string): VFSNode | null {
  const { node } = traverse(path);
  return node ? JSON.parse(JSON.stringify(node)) : null;
}

export function createFile(path: string, content: string = ''): boolean {
  const parts = path.split('/').filter(p => p);
  const fileName = parts.pop();
  if (!fileName) return false;
  
  const parentPath = '/' + parts.join('/');
  const { node: parentNode } = traverse(parentPath);
  
  if (!parentNode || parentNode.type !== 'directory') return false;

  const targetParent = parentNode as VFSDirectory;

  if (targetParent.children[fileName]) { // handle name collision
      let i = 1;
      const nameParts = fileName.split('.');
      const baseName = nameParts.length > 1 ? nameParts.slice(0, -1).join('.') : fileName;
      const ext = nameParts.length > 1 ? nameParts.slice(-1)[0] : '';
      
      let newName: string;
      do {
          newName = ext ? `${baseName}_${i}.${ext}` : `${baseName}_${i}`;
          i++;
      } while (targetParent.children[newName]);

      targetParent.children[newName] = { type: 'file', name: newName, content };
  } else {
    targetParent.children[fileName] = { type: 'file', name: fileName, content };
  }
  
  saveFileSystem();
  return true;
}

export function createDirectory(path: string): boolean {
    const { parent: parentNode, node: existingNode, name: dirName } = traverse(path);

    if (existingNode) { // Name already exists
        let i = 1;
        let newPath = `${path}_${i}`;
        while(getNode(newPath)) {
            i++;
            newPath = `${path}_${i}`;
        }
       return createDirectory(newPath);
    }
    
    if (!parentNode || !dirName || parentNode.type !== 'directory') return false;

    parentNode.children[dirName] = { type: 'directory', name: dirName, children: {} };
    saveFileSystem();
    return true;
}

export const createFolder = createDirectory;

export function writeFile(path: string, content: string): boolean {
  // We must get the live node, not a clone, to modify it.
  const { node: liveNode } = traverse(path);
  if (!liveNode || liveNode.type !== 'file') return false;
  
  (liveNode as VFSFile).content = content;
  
  saveFileSystem();
  return true;
}

export function deleteNode(path: string): boolean {
    const { parent, name } = traverse(path);
    if (!parent || !parent.children[name]) return false;
    delete parent.children[name];
    saveFileSystem();
    return true;
}

export function renameNode(path: string, newName: string): boolean {
    const { parent, node, name } = traverse(path);
    if (!parent || !node) return false;
    if (parent.children[newName]) return false; // Name exists

    delete parent.children[name];
    node.name = newName;
    parent.children[newName] = node;
    saveFileSystem();
    return true;
}

export function resolvePath(currentPath: string, targetPath: string): string {
    if (!targetPath) return currentPath;
    if (targetPath.startsWith('/')) {
        return targetPath;
    }

    const parts = currentPath.split('/').filter(p => p);
    const targetParts = targetPath.split('/').filter(p => p);

    for (const part of targetParts) {
        if (part === '..') {
            parts.pop();
        } else if (part !== '.') {
            parts.push(part);
        }
    }
    
    const newPath = '/' + parts.join('/');
    // Check if the resolved path actually exists before returning it
    const resolvedNode = getNode(newPath);
    return resolvedNode ? newPath : currentPath; // return old path if invalid
}

function searchRecursive(current: VFSNode, currentPath: string, query: string, results: { node: VFSNode; path: string }[]) {
  if (current.name.toLowerCase().includes(query.toLowerCase())) {
    // Exclude the root itself from search results
    if (currentPath !== '/') {
      results.push({ node: current, path: currentPath });
    }
  }

  if (current.type === 'directory') {
    for (const childName in current.children) {
      const child = current.children[childName];
      const childPath = currentPath === '/' ? `/${childName}` : `${currentPath}/${childName}`;
      searchRecursive(child, childPath, query, results);
    }
  }
}

export function search(query: string): { node: VFSNode; path: string }[] {
  if (!query) return [];
  const lowercaseQuery = query.toLowerCase();
  const results: { node: VFSNode; path: string }[] = [];
  searchRecursive(fs, '/', lowercaseQuery, results);
  return results;
}

// --- Trash / Lixeira Management ---

export function getTrashItems(): TrashItem[] {
  try {
    const raw = localStorage.getItem(VFS_TRASH_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load trash items:", e);
    return [];
  }
}

function saveTrashItems(items: TrashItem[]) {
  try {
    localStorage.setItem(VFS_TRASH_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save trash items:", e);
  }
}

export function moveToTrash(path: string): boolean {
  const { parent, node, name } = traverse(path);
  if (!parent || !node || !name) return false;

  const currentTrash = getTrashItems();
  const trashItem: TrashItem = {
    id: `trash_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    originalPath: path,
    name: name,
    deletedAt: Date.now(),
    node: JSON.parse(JSON.stringify(node))
  };

  currentTrash.unshift(trashItem);
  saveTrashItems(currentTrash);

  delete parent.children[name];
  saveFileSystem();
  return true;
}

export function restoreTrashItem(id: string): boolean {
  const trash = getTrashItems();
  const itemIndex = trash.findIndex(i => i.id === id);
  if (itemIndex === -1) return false;

  const item = trash[itemIndex];
  const parts = item.originalPath.split('/').filter(p => p);
  const fileName = parts.pop() || item.name;
  const parentPath = '/' + parts.join('/');

  let { node: parentNode } = traverse(parentPath);
  // If parent folder was also deleted or doesn't exist, restore to Desktop
  if (!parentNode || parentNode.type !== 'directory') {
    const desktopNode = traverse('/home/user/Desktop').node;
    if (desktopNode && desktopNode.type === 'directory') {
      parentNode = desktopNode;
    }
  }

  if (parentNode && parentNode.type === 'directory') {
    const dir = parentNode as VFSDirectory;
    let targetName = fileName;
    let counter = 1;
    while (dir.children[targetName]) {
      const dot = fileName.lastIndexOf('.');
      if (dot > 0) {
        targetName = `${fileName.slice(0, dot)} (${counter})${fileName.slice(dot)}`;
      } else {
        targetName = `${fileName} (${counter})`;
      }
      counter++;
    }

    const restoredNode = JSON.parse(JSON.stringify(item.node));
    restoredNode.name = targetName;
    dir.children[targetName] = restoredNode;

    trash.splice(itemIndex, 1);
    saveTrashItems(trash);
    saveFileSystem();
    return true;
  }

  return false;
}

export function restoreAllTrash(): boolean {
  const trash = getTrashItems();
  if (trash.length === 0) return true;
  
  for (const item of [...trash]) {
    restoreTrashItem(item.id);
  }
  return true;
}

export function deletePermanently(id: string): boolean {
  const trash = getTrashItems();
  const filtered = trash.filter(i => i.id !== id);
  saveTrashItems(filtered);
  return true;
}

export function emptyTrash(): boolean {
  saveTrashItems([]);
  return true;
}

// --- Browser Download to VFS & Real Device ---

export function downloadToVFS(fileName: string, content: string, triggerRealDownload: boolean = true): boolean {
  const downloadPath = `/home/user/Downloads/${fileName}`;
  const success = createFile(downloadPath, content);

  if (triggerRealDownload && typeof window !== 'undefined') {
    try {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn("Could not trigger native browser download:", e);
    }
  }

  return success;
}
