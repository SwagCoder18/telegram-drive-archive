import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Image, Video, Music, Archive, Download, MoreVertical, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface File {
  id: number;
  name: string;
  size: string;
  type: string;
  folder: string;
  uploadedAt: string;
  telegramFileId?: string;
  telegramMessageId?: number;
}

interface FileGridProps {
  files: File[];
  viewMode: 'grid' | 'list';
  onRefresh?: () => void;
}

const FileGrid = ({ files, viewMode, onRefresh }: FileGridProps) => {
  const { toast } = useToast();

  const getFileIcon = (type: string) => {
    const iconClass = "w-8 h-8";
    switch (type) {
      case 'images':
        return <Image className={`${iconClass} text-green-600`} />;
      case 'videos':
        return <Video className={`${iconClass} text-red-600`} />;
      case 'audio':
        return <Music className={`${iconClass} text-purple-600`} />;
      case 'archives':
        return <Archive className={`${iconClass} text-orange-600`} />;
      default:
        return <FileText className={`${iconClass} text-blue-600`} />;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'images':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'videos':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'audio':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'archives':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const handleDownload = async (file: File) => {
    if (!file.telegramFileId) {
      toast({
        title: "Download failed",
        description: "File ID not found.",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Download started",
        description: `Downloading ${file.name} from Telegram storage...`,
      });

      const { data, error } = await supabase.functions.invoke('telegram-service', {
        body: {
          action: 'download',
          fileId: file.telegramFileId
        }
      });

      if (error) throw error;

      // Create blob and download
      const blob = new Blob([data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download completed",
        description: `${file.name} has been downloaded successfully.`,
      });
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: error.message || "Failed to download file from Telegram storage.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (file: File) => {
    if (!file.telegramMessageId) {
      toast({
        title: "Delete failed",
        description: "Message ID not found.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('telegram-service', {
        body: {
          action: 'delete',
          messageId: file.telegramMessageId
        }
      });

      if (error) throw error;

      toast({
        title: "File deleted",
        description: `${file.name} has been removed from your storage.`,
      });

      // Refresh the file list
      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete file from Telegram storage.",
        variant: "destructive",
      });
    }
  };

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No files found</h3>
        <p className="text-muted-foreground">Upload some files to get started</p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="text-left py-3 px-4 font-medium text-foreground">Name</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Type</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Size</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Modified</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.type)}
                      <span className="font-medium text-foreground">{file.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary" className={getFileTypeColor(file.type)}>
                      {file.type}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{file.size}</td>
                  <td className="py-3 px-4 text-muted-foreground">{file.uploadedAt}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(file)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleDownload(file)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(file)} className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {files.map((file) => (
          <Card key={file.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-4 bg-muted rounded-lg group-hover:bg-muted/80 transition-colors">
                  {getFileIcon(file.type)}
                </div>
                <div className="space-y-1 w-full">
                  <p className="font-medium text-foreground truncate" title={file.name}>
                    {file.name}
                  </p>
                  <div className="flex items-center justify-center space-x-2">
                    <Badge variant="secondary" className={`${getFileTypeColor(file.type)} text-xs`}>
                      {file.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{file.size}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{file.uploadedAt}</p>
                </div>
                <div className="flex items-center space-x-2 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDownload(file)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleDownload(file)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(file)} className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FileGrid;