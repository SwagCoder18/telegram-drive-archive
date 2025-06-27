import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Cloud, LogOut, Upload, Folder, FileText, Image, Video, Music, Archive, Grid, List, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import FileUpload from "@/components/FileUpload";
import FileGrid from "@/components/FileGrid";
import Sidebar from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface DashboardProps {
  onLogout: () => void;
}

interface FileRecord {
  id: string;
  name: string;
  size: number;
  type: string;
  folder_path: string;
  created_at: string;
  telegram_file_id: string;
  telegram_message_id: number;
  mime_type?: string;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const { signOut } = useAuth();

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error: any) {
      console.error('Error fetching files:', error);
      toast({
        title: "Error loading files",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      onLogout();
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeFromName = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(extension)) return 'images';
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', '3gp'].includes(extension)) return 'videos';
    if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma'].includes(extension)) return 'audio';
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(extension)) return 'archives';
    return 'documents';
  };

  // Transform database files to match the expected format
  const transformedFiles = files.map(file => ({
    id: parseInt(file.id),
    name: file.name,
    size: formatFileSize(file.size),
    type: getFileTypeFromName(file.name),
    folder: getFileTypeFromName(file.name),
    uploadedAt: new Date(file.created_at).toLocaleDateString(),
    telegramFileId: file.telegram_file_id,
    telegramMessageId: file.telegram_message_id
  }));

  // Calculate file counts by type
  const fileCounts = {
    all: transformedFiles.length,
    documents: transformedFiles.filter(f => f.type === 'documents').length,
    images: transformedFiles.filter(f => f.type === 'images').length,
    videos: transformedFiles.filter(f => f.type === 'videos').length,
    audio: transformedFiles.filter(f => f.type === 'audio').length,
    archives: transformedFiles.filter(f => f.type === 'archives').length,
  };

  const filteredFiles = transformedFiles.filter(file => {
    const matchesFolder = selectedFolder === 'all' || file.folder === selectedFolder;
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const recentUploads = files.filter(file => {
    const uploadDate = new Date(file.created_at);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return uploadDate > yesterday;
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 animate-pulse">
            <Cloud className="w-8 h-8 text-white" />
          </div>
          <p className="text-muted-foreground">Loading your files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <Sidebar 
        selectedFolder={selectedFolder} 
        onFolderSelect={setSelectedFolder}
        fileCounts={fileCounts}
      />
      
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-foreground mb-4">Folders</h2>
            <nav className="space-y-1">
              {[
                { id: 'all', label: 'All Files', icon: Grid, count: fileCounts.all },
                { id: 'documents', label: 'Documents', icon: FileText, count: fileCounts.documents },
                { id: 'images', label: 'Images', icon: Image, count: fileCounts.images },
                { id: 'videos', label: 'Videos', icon: Video, count: fileCounts.videos },
                { id: 'audio', label: 'Audio', icon: Music, count: fileCounts.audio },
                { id: 'archives', label: 'Archives', icon: Archive, count: fileCounts.archives },
              ].map((folder) => (
                <Button
                  key={folder.id}
                  variant={selectedFolder === folder.id ? 'secondary' : 'ghost'}
                  className={cn(
                    "w-full justify-between text-left h-auto py-3",
                    selectedFolder === folder.id && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => {
                    setSelectedFolder(folder.id);
                    setSidebarOpen(false);
                  }}
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
        </SheetContent>
      </Sheet>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-card border-b px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSidebarOpen(true)}>
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Cloud className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-foreground">TeleDrive</h1>
              </div>
              <Separator orientation="vertical" className="h-6 hidden sm:block" />
              <div className="relative flex-1 max-w-md hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search files..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="flex items-center space-x-1 md:space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <ThemeToggle />
              <FileUpload />
              <Button variant="outline" onClick={handleLogout} size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
          
          {/* Mobile Search */}
          <div className="relative mt-4 sm:hidden">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search files..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-4 md:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Files</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{files.length}</div>
                <p className="text-xs text-muted-foreground">Stored in Telegram</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                <Archive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatFileSize(totalSize)}</div>
                <p className="text-xs text-muted-foreground">Unlimited storage</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recentUploads}</div>
                <p className="text-xs text-muted-foreground">In the last 24h</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">File Types</CardTitle>
                <Folder className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{new Set(transformedFiles.map(f => f.type)).size}</div>
                <p className="text-xs text-muted-foreground">Different types</p>
              </CardContent>
            </Card>
          </div>

          {/* Files Grid */}
          <div className="bg-card rounded-lg border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">
                {selectedFolder === 'all' ? 'All Files' : `${selectedFolder.charAt(0).toUpperCase() + selectedFolder.slice(1)} Files`}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <FileGrid files={filteredFiles} viewMode={viewMode} onRefresh={fetchFiles} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;