/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Portfolio from './pages/Portfolio';
import ProjectDetail from './pages/ProjectDetail';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import RequestQuote from './pages/RequestQuote';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

// Admin Pages
import AdminLogin from './pages/admin/Login';
import ResetPassword from './pages/admin/ResetPassword';
import AdminDashboardLayout from './pages/admin/DashboardLayout';
import AdminOverview from './pages/admin/Overview';
import AdminPortfolioManager from './pages/admin/PortfolioManager';
import AdminPortfolioPreview from './pages/admin/PortfolioPreview';
import AdminBlogManager from './pages/admin/BlogManager';
import AdminBlogPreview from './pages/admin/BlogPreview';
import AdminLeadsManager from './pages/admin/LeadsManager';
import AdminLeadDetails from './pages/admin/LeadDetails';
import AdminSubscribersManager from './pages/admin/SubscribersManager';
import AdminArchiveManager from './pages/admin/ArchiveManager';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'services',
        element: <Services />,
      },
      {
        path: 'portfolio',
        element: <Portfolio />,
      },
      {
        path: 'portfolio/:id',
        element: <ProjectDetail />,
      },
      {
        path: 'blog',
        element: <Blog />,
      },
      {
        path: 'blog/:id',
        element: <BlogPost />,
      },
      {
        path: 'request-quote',
        element: <RequestQuote />,
      },
      {
        path: 'privacy-policy',
        element: <PrivacyPolicy />,
      },
      {
        path: 'terms-of-service',
        element: <TermsOfService />,
      },
    ],
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/admin/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/admin/dashboard',
    element: <AdminDashboardLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard/overview" replace />,
      },
      {
        path: 'overview',
        element: <AdminOverview />,
      },
      {
        path: 'portfolio',
        element: <AdminPortfolioManager />,
      },
      {
        path: 'portfolio/:id/preview',
        element: <AdminPortfolioPreview />,
      },
      {
        path: 'blog',
        element: <AdminBlogManager />,
      },
      {
        path: 'blog/:id/preview',
        element: <AdminBlogPreview />,
      },
      {
        path: 'leads',
        element: <AdminLeadsManager />,
      },
      {
        path: 'leads/:id',
        element: <AdminLeadDetails />,
      },
      {
        path: 'subscribers',
        element: <AdminSubscribersManager />,
      },
      {
        path: 'archive',
        element: <AdminArchiveManager />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default function App() {
  useEffect(() => {
    // Detect standard modern navigation type 'reload', or fallback performance.navigation.type === 1
    const navEntries = performance.getEntriesByType('navigation');
    const isReload = navEntries.length > 0 && (navEntries[0] as PerformanceNavigationTiming).type === 'reload';
    const isLegacyReload = window.performance && window.performance.navigation && window.performance.navigation.type === 1;

    if (isReload || isLegacyReload) {
      localStorage.removeItem('las_solar_form_lead_context');
      localStorage.removeItem('las_solar_calculator_context');
      sessionStorage.removeItem('las_solar_trigger_prefill_form');
      window.dispatchEvent(new Event('las-solar-context-updated'));
    }
  }, []);

  return <RouterProvider router={router} />;
}
