
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Folder, FileText, Image, Archive, Music, Video, Shield, Cloud, Zap } from "lucide-react";
import Login from "@/components/Login";
import Dashboard from "@/components/Dashboard";
import AuthPage from "@/components/AuthPage";
import TelegramSetup from "@/components/TelegramSetup";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { user, loading } = useAuth();
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [telegramSetupComplete, setTelegramSetupComplete] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);

  useEffect(() => {
    const checkTelegramSetup = async () => {
      if (!user) {
        setCheckingSetup(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('telegram_setup_completed')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setTelegramSetupComplete(data?.telegram_setup_completed || false);
      } catch (error) {
        console.error('Error checking Telegram setup:', error);
        setTelegramSetupComplete(false);
      } finally {
        setCheckingSetup(false);
      }
    };

    checkTelegramSetup();
  }, [user]);

  if (loading || checkingSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 animate-pulse">
            <Cloud className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (showAuthPage) {
    return <AuthPage />;
  }

  if (user) {
    if (!telegramSetupComplete) {
      return (
        <TelegramSetup 
          onSetupComplete={() => setTelegramSetupComplete(true)} 
        />
      );
    }
    return <Dashboard onLogout={() => setTelegramSetupComplete(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">TeleDrive</h1>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setShowAuthPage(true)}
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6">
              <Cloud className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Cloud Storage
              <span className="text-blue-600 block">Powered by Telegram</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Secure, unlimited file storage using your own Telegram bot and private channel. 
              Upload, organize, and access your files from anywhere.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              onClick={() => setShowAuthPage(true)}
            >
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-3">
              Learn More
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Your Own Bot</CardTitle>
                <CardDescription>
                  Use your own Telegram bot and private channel for complete control over your data
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Lightning Fast</CardTitle>
                <CardDescription>
                  Upload and download files at blazing speeds with Telegram's global CDN
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Cloud className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Unlimited Space</CardTitle>
                <CardDescription>
                  Store as many files as you need without worrying about storage limits
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* File Types */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Support for All File Types</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { icon: FileText, label: "Documents", color: "blue" },
                { icon: Image, label: "Images", color: "green" },
                { icon: Video, label: "Videos", color: "red" },
                { icon: Music, label: "Audio", color: "purple" },
                { icon: Archive, label: "Archives", color: "orange" },
                { icon: Folder, label: "Folders", color: "yellow" }
              ].map((type, index) => (
                <div key={index} className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2 shadow-sm">
                  <type.icon className={`w-5 h-5 text-${type.color}-600`} />
                  <span className="text-sm font-medium text-gray-700">{type.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold">TeleDrive</h3>
          </div>
          <p className="text-gray-400">Secure cloud storage powered by your own Telegram bot</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
