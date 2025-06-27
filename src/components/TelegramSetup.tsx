
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bot, MessageCircle, Shield, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface TelegramSetupProps {
  onSetupComplete: () => void;
}

const TelegramSetup = ({ onSetupComplete }: TelegramSetupProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [botToken, setBotToken] = useState("");
  const [channelId, setChannelId] = useState("");
  const [botUsername, setBotUsername] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          bot_token: botToken,
          channel_id: channelId,
          bot_username: botUsername || null,
          telegram_setup_completed: true,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Telegram Setup Complete!",
        description: "Your bot has been configured successfully.",
      });

      onSetupComplete();
    } catch (error: any) {
      toast({
        title: "Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Setup Your Telegram Bot</h1>
          <p className="text-gray-600 mt-2">Configure your personal Telegram storage</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Before You Start
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Alert>
                <Bot className="h-4 w-4" />
                <AlertDescription>
                  <strong>Step 1:</strong> Create a bot by messaging @BotFather on Telegram and get your Bot Token
                </AlertDescription>
              </Alert>
              <Alert>
                <MessageCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Step 2:</strong> Create a private channel and add your bot as an admin with posting permissions
                </AlertDescription>
              </Alert>
            </div>
            <Alert>
              <Check className="h-4 w-4" />
              <AlertDescription>
                <strong>Step 3:</strong> Get your Channel ID (usually starts with -100) by forwarding a message from the channel to @userinfobot
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bot Configuration</CardTitle>
            <CardDescription>Enter your Telegram bot credentials to start using TeleDrive</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="botToken">Bot Token *</Label>
                <Input
                  id="botToken"
                  type="password"
                  placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500">Get this from @BotFather on Telegram</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="channelId">Channel ID *</Label>
                <Input
                  id="channelId"
                  type="text"
                  placeholder="-1001234567890"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500">Your private channel ID (starts with -100)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="botUsername">Bot Username (Optional)</Label>
                <Input
                  id="botUsername"
                  type="text"
                  placeholder="@your_bot_username"
                  value={botUsername}
                  onChange={(e) => setBotUsername(e.target.value)}
                />
                <p className="text-sm text-gray-500">For validation purposes</p>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Setting up..." : "Complete Setup"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TelegramSetup;
