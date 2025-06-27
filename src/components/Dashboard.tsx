
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Cloud, LogOut, Upload, Folder, FileText, Image, Video, Music, Archive, Grid, List, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import FileUpload from "@/components/FileUpload";
import FileGrid from "@/components/FileGrid";
import Sidebar from "@/components/Sidebar";

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for demonstration
  const files = [
    { id: 1, name: 'Project Proposal.pdf', size: '2.4 MB', type: 'pdf', folder: 'documents', uploadedAt: '2024-01-15' },
    { id: 2, name: 'Vacation Photos.zip', size: '45.2 MB', type: 'archive', folder: 'archives', uploadedAt: '2024-01-14' },
    { id: 3, name: 'Presentation.pptx', size: '8.7 MB', type: 'document', folder: 'documents', uploadedAt: '2024-01-13' },
    { id: 4, name: 'Screenshot.png', size: '1.2 MB', type: 'image', folder: 'images', uploadedAt: '2024-01-12' },
    { id: 5, name: 'Music Album.mp3', size: '12.8 MB', type: 'audio', folder: 'audio', uploadedAt: '2024-01-11' },
    { id: 6, name: 'Tutorial Video.mp4', size: '128.4 MB', type: 'video', folder: 'videos', uploadedAt: '2024-01-10' },
  ];

  const filteredFiles = files.filter(file => {
    const matchesFolder = selectedFolder === 'all' || file.folder === selectedFolder;
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar selectedFolder={selectedFolder} onFolderSelect={setSelectedFolder} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Cloud className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">TeleDrive</h1>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Search files..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
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
              <FileUpload />
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Files</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{files.length}</div>
                <p className="text-xs text-muted-foreground">+2 from last week</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                <Archive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">198.7 MB</div>
                <p className="text-xs text-muted-foreground">12% of unlimited</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">In the last 24h</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Folders</CardTitle>
                <Folder className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">Organized collections</p>
              </CardContent>
            </Card>
          </div>

          {/* Files Grid */}
          <div className="bg-white rounded-lg border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">
                {selectedFolder === 'all' ? 'All Files' : `${selectedFolder.charAt(0).toUpperCase() + selectedFolder.slice(1)} Files`}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <FileGrid files={filteredFiles} viewMode={viewMode} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
