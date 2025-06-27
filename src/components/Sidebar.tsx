import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, Image, Video, Music, Archive, Folder, Grid } from "lucide-react";

interface SidebarProps {
  selectedFolder: string;
  onFolderSelect: (folder: string) => void;
  fileCounts?: {
    all: number;
    documents: number;
    images: number;
    videos: number;
    audio: number;
    archives: number;
  };
}

const Sidebar = ({ selectedFolder, onFolderSelect, fileCounts }: SidebarProps) => {
  const folders = [
    { id: 'all', label: 'All Files', icon: Grid, count: fileCounts?.all || 0 },
    { id: 'documents', label: 'Documents', icon: FileText, count: fileCounts?.documents || 0 },
    { id: 'images', label: 'Images', icon: Image, count: fileCounts?.images || 0 },
    { id: 'videos', label: 'Videos', icon: Video, count: fileCounts?.videos || 0 },
    { id: 'audio', label: 'Audio', icon: Music, count: fileCounts?.audio || 0 },
    { id: 'archives', label: 'Archives', icon: Archive, count: fileCounts?.archives || 0 },
  ];

  return (
    <div className="w-64 bg-card border-r h-full hidden md:block">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-foreground mb-4">Folders</h2>
        <nav className="space-y-1">
          {folders.map((folder) => (
            <Button
              key={folder.id}
              variant={selectedFolder === folder.id ? 'secondary' : 'ghost'}
              className={cn(
                "w-full justify-between text-left h-auto py-3",
                selectedFolder === folder.id && "bg-accent text-accent-foreground"
              )}
              onClick={() => onFolderSelect(folder.id)}
            >
              <div className="flex items-center space-x-3">
                <folder.icon className="w-5 h-5" />
                <span className="font-medium">{folder.label}</span>
              </div>
              <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
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