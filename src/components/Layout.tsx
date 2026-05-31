import { useState, useEffect } from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import SisterBusinessSection from './common/SisterBusinessSection';
import MaintenanceScreen from './MaintenanceScreen';
import { getSolarSettings } from '../lib/settings';

export default function Layout() {
  const [maintenanceActive, setMaintenanceActive] = useState(getSolarSettings().maintenanceMode);

  useEffect(() => {
    const handleSettingsChanged = () => {
      setMaintenanceActive(getSolarSettings().maintenanceMode);
    };
    window.addEventListener('las-solar-settings-changed', handleSettingsChanged);
    return () => {
      window.removeEventListener('las-solar-settings-changed', handleSettingsChanged);
    };
  }, []);

  if (maintenanceActive) {
    return (
      <div className="min-h-screen bg-black">
        <MaintenanceScreen />
        <ScrollRestoration />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <SisterBusinessSection />
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
