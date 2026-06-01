/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SolarSettings {
  // 1. Solar Company Profile & Identity
  logoDarkDashboard: string; // Base64 or URL
  logoWhiteBackground: string; // Base64 or URL
  favicon: string; // Base64 or URL
  licensingAccreditation: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;

  // 2. Systems Control & Project Asset Safety
  maintenanceMode: boolean;
  leadRoutingTarget: string;
}

const DEFAULT_SETTINGS: SolarSettings = {
  logoDarkDashboard: 'https://lh3.googleusercontent.com/d/1odxn3puWfrPEf2mgoz4JLupNHXlwpvRO',
  logoWhiteBackground: 'https://lh3.googleusercontent.com/d/1odxn3puWfrPEf2mgoz4JLupNHXlwpvRO',
  favicon: '',
  licensingAccreditation: '',
  businessEmail: 'lyndon_santos@ymail.com',
  businessPhone: '09173085095',
  businessAddress: 'Jade Villas, Imus, Cavite',
  maintenanceMode: false,
  leadRoutingTarget: 'leads@lassolarset-up.com'
};

const STORAGE_KEY = 'las_solar_official_settings';

export function getSolarSettings(): SolarSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load settings', e);
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveSolarSettings(settings: Partial<SolarSettings>): SolarSettings {
  const current = getSolarSettings();
  const updated = { ...current, ...settings };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Dispatch a custom event so other components refresh dynamically
    window.dispatchEvent(new Event('las-solar-settings-changed'));
    
    // Dynamically update favicon if set
    if (updated.favicon) {
      updateFavicon(updated.favicon);
    }
    
    // Dynamically update document title if maintenance mode is on
    if (updated.maintenanceMode) {
      document.title = 'System Upgrades in Progress - Las Solar Set-up';
    }
  } catch (e) {
    console.error('Failed to save settings', e);
  }
  return updated;
}

export function updateFavicon(url: string) {
  let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = url;
}
