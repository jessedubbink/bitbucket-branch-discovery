import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="w-32 h-5" />
              </div>
              <Skeleton className="w-16 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2].map((j) => (
                <div key={j} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-4 h-4" />
                    <div>
                      <Skeleton className="w-24 h-4 mb-1" />
                      <Skeleton className="w-48 h-3" />
                    </div>
                  </div>
                  <Skeleton className="w-16 h-5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-3 text-muted-foreground">Loading repositories...</span>
    </div>
  );
}