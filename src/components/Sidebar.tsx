
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, Image, Video, Music, Archive, Folder, Grid } from "lucide-react";

interface SidebarProps {
  selectedFolder: string;
  onFolderSelect: (folder: string) => void;
}

const Sidebar = ({ selectedFolder, onFolderSelect }: SidebarProps) => {
  const folders = [
    { id: 'all', label: 'All Files', icon: Grid, count: 6 },
    { id: 'documents', label: 'Documents', icon: FileText, count: 2 },
    { id: 'images', label: 'Images', icon: Image, count: 1 },
    { id: 'videos', label: 'Videos', icon: Video, count: 1 },
    { id: 'audio', label: 'Audio', icon: Music, count: 1 },
    { id: 'archives', label: 'Archives', icon: Archive, count: 1 },
  ];

  return (
    <div className="w-64 bg-white border-r h-full">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Folders</h2>
        <nav className="space-y-1">
          {folders.map((folder) => (
            <Button
              key={folder.id}
              variant={selectedFolder === folder.id ? 'secondary' : 'ghost'}
              className={cn(
                "w-full justify-between text-left h-auto py-3",
                selectedFolder === folder.id && "bg-blue-50 text-blue-700 border-blue-200"
              )}
              onClick={() => onFolderSelect(folder.id)}
            >
              <div className="flex items-center space-x-3">
                <folder.icon className="w-5 h-5" />
                <span className="font-medium">{folder.label}</span>
              </div>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {folder.count}
              </span>
            </Button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
