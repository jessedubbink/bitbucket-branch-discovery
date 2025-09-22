import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Home, GitBranch, Search } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex items-center justify-center bg-muted/5 p-8">
      <Card className="max-w-md w-full p-8 text-center border-2 border-dashed border-muted-foreground/20">
        <div className="space-y-6">
          {/* 404 Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                <GitBranch className="w-12 h-12 text-muted-foreground" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-destructive rounded-full flex items-center justify-center">
                <Search className="w-4 h-4 text-destructive-foreground" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-muted-foreground">404</h1>
            <h2 className="text-xl font-semibold">Page Not Found</h2>
            <p className="text-muted-foreground">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Suggestions */}
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Here are some things you can try:</p>
            <ul className="text-left space-y-1">
              <li>• Check the URL for typos</li>
              <li>• Go back to the previous page</li>
              <li>• Visit the home page to browse repositories</li>
              <li>• Use the sidebar to navigate to a specific repository</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button
              onClick={() => navigate('/')}
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Home Page
            </Button>
          </div>

          {/* Additional Help */}
          <div className="pt-4 border-t border-muted">
            <p className="text-xs text-muted-foreground">
              If you think this is an error, please check the repository sidebar
              for available repositories and branches.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
