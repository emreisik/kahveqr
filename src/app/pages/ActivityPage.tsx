import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { ActivityList } from '../components/activity/ActivityList';
import { getState, getCafes } from '@/lib/store';
import { Activity, Coffee } from 'lucide-react';
import { Cafe } from '@/lib/types';

export function ActivityPage() {
  const [state, setState] = useState<any>(null);
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [stateData, cafesData] = await Promise.all([
          getState(),
          getCafes(),
        ]);
        setState(stateData);
        setCafes(cafesData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !state) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Coffee className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-white dark:bg-card border-b sticky top-0 z-40 backdrop-blur-lg bg-white/80 dark:bg-card/80">
        <div className="flex items-center justify-center h-16 px-4 max-w-lg mx-auto">
          <h1 className="text-lg font-bold text-foreground">Aktivite</h1>
        </div>
      </header>

      <main className="pt-6 px-4 max-w-lg mx-auto">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-6 h-10 bg-muted/30">
            <TabsTrigger value="all" className="text-sm">
              Tümü
            </TabsTrigger>
            <TabsTrigger value="earn" className="text-sm">
              Kazanılan
            </TabsTrigger>
            <TabsTrigger value="redeem" className="text-sm">
              Kullanılan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <div className="bg-white dark:bg-card rounded-xl border">
              <ActivityList activities={state.activities} cafes={cafes} filter="all" />
            </div>
          </TabsContent>

          <TabsContent value="earn" className="mt-0">
            <div className="bg-white dark:bg-card rounded-xl border">
              <ActivityList activities={state.activities} cafes={cafes} filter="earn" />
            </div>
          </TabsContent>

          <TabsContent value="redeem" className="mt-0">
            <div className="bg-white dark:bg-card rounded-xl border">
              <ActivityList activities={state.activities} cafes={cafes} filter="redeem" />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}