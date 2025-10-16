
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Home } from 'lucide-react';
import CreateListing from '@/components/CreateListing';
import ListingsFeed from '@/components/ListingsFeed';

const MobilePage = () => {
  const [activeTab, setActiveTab] = useState('feed');

  const handleListingCreated = () => {
    setActiveTab('feed');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <h1 className="text-xl font-bold text-center">DreamFlow</h1>
      </div>

      {/* Content */}
      <div className="flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab Content */}
          <div className="px-4 py-6">
            <TabsContent value="feed" className="mt-0">
              <ListingsFeed />
            </TabsContent>

            <TabsContent value="create" className="mt-0">
              <CreateListing onSuccess={handleListingCreated} />
            </TabsContent>
          </div>

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
            <TabsList className="grid w-full grid-cols-2 h-16 bg-transparent">
              <TabsTrigger 
                value="feed" 
                className="flex-col gap-1 h-full data-[state=active]:bg-primary/10"
              >
                <Home className="h-5 w-5" />
                <span className="text-xs">Accueil</span>
              </TabsTrigger>
              <TabsTrigger 
                value="create" 
                className="flex-col gap-1 h-full data-[state=active]:bg-primary/10"
              >
                <Plus className="h-5 w-5" />
                <span className="text-xs">Créer</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-16"></div>
    </div>
  );
};

export default MobilePage;
