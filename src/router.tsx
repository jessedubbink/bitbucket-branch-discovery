import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import { Layout } from './components/layout/Layout';
import NotFound from './components/common/NotFound';
import RepositoryView from './components/views/RepositoryView';
import BranchesView from './components/views/BranchesView';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <App />,
      },
      {
        path: 'repository/:repoName',
        element: <RepositoryView />,
      },
      {
        path: 'branches',
        element: <BranchesView />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}