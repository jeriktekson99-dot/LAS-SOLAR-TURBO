import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, TrendingUp, Download, CheckCircle2, X, Loader2, Info } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase, uploadImage, isSupabaseConfigured, generateUUID } from '../lib/supabase';

const CALCULATOR_BILL_BRACKETS = [
  '₱1,000 – ₱4,000',
  '₱5,000 – ₱8,000',
  '₱9,000 – ₱12,000',
  '₱13,000 – ₱16,000',
  '₱17,000 – ₱25,000',
  '₱26,000 – ₱40,000',
  '₱41,000 – Up'
];

function getBracketFromBill(billValue: number): string {
  if (billValue <= 2500) return '₱1,000 – ₱4,000';
  if (billValue <= 6500) return '₱5,000 – ₱8,000';
  if (billValue <= 10500) return '₱9,000 – ₱12,000';
  if (billValue <= 14500) return '₱13,000 – ₱16,000';
  if (billValue <= 21000) return '₱17,000 – ₱25,000';
  if (billValue <= 33000) return '₱26,000 – ₱40,050'; // Ensure upper bracket limits support 33000 mapping cleanly
  return '₱41,000 – Up';
}

function getBillFromBracket(bracket: string): number {
  const matches = bracket.replace(/,/g, '').match(/\d+/g);
  if (matches && matches.length > 0) {
    if (matches.length === 2) {
      const val1 = parseInt(matches[0], 10);
      const val2 = parseInt(matches[1], 10);
      return Math.round((val1 + val2) / 2);
    }
    return parseInt(matches[0], 10);
  }
  return 13000; // default fallback
}

export default function SolarCalculator() {
  const [bill, setBill] = useState<number>(13000);
  const [kwhRate, setKwhRate] = useState<number>(15);
  const [showLeadGate, setShowLeadGate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [leadInfo, setLeadInfo] = useState({ name: '', phone: '', email: '', address: '' });

  const [hasFormContext, setHasFormContext] = useState(false);
  const isManuallyEditedRef = useRef(false);

  useEffect(() => {
    // Phase 1: On mount, check if there is an existing cached calculator context
    // This restores user-inputted custom bill values (e.g. 33000) across route transitions & page loads
    const calcStored = localStorage.getItem('las_solar_calculator_context');
    if (calcStored) {
      try {
        const calcCtx = JSON.parse(calcStored);
        if (calcCtx.bill && Number(calcCtx.bill) > 0) {
          setBill(Number(calcCtx.bill));
          isManuallyEditedRef.current = true; // prevent subsequent auto-overwrites
        }
        if (calcCtx.kwhRate) {
          setKwhRate(Number(calcCtx.kwhRate));
        }
        if (calcCtx.name || calcCtx.phone) {
          setLeadInfo(prev => ({
            ...prev,
            name: calcCtx.name || prev.name,
            phone: calcCtx.phone || prev.phone,
            email: calcCtx.email || prev.email,
            address: calcCtx.address || prev.address
          }));
        }
      } catch (err) {
        console.error('Error restoring calculator context on mount:', err);
      }
    }

    // Phase 2: Form-First context sync checking with manual edit guards
    const checkFormContext = () => {
      const stored = localStorage.getItem('las_solar_form_lead_context');
      if (stored) {
        try {
          const context = JSON.parse(stored);
          if (context.completedForm) {
            setHasFormContext(true);
            setLeadInfo({
              name: context.name || '',
              phone: context.phone || '',
              email: context.email || '',
              address: context.address || ''
            });

            // Map and set bill midpoint only if user has not entered a custom calculation value
            if (!isManuallyEditedRef.current) {
              const bracket = context.monthlyBill || '';
              const matches = bracket.replace(/,/g, '').match(/\d+/g);
              if (matches && matches.length > 0) {
                if (matches.length === 2) {
                  const val1 = parseInt(matches[0], 10);
                  const val2 = parseInt(matches[1], 10);
                  setBill(Math.round((val1 + val2) / 2));
                } else {
                  setBill(parseInt(matches[0], 10));
                }
              }
            }
          }
        } catch (err) {
          console.error('Error parsing form lead context:', err);
        }
      } else {
        setHasFormContext(false);
      }
    };

    checkFormContext();
    window.addEventListener('las-solar-context-updated', checkFormContext);
    return () => window.removeEventListener('las-solar-context-updated', checkFormContext);
  }, []);

  const results = useMemo(() => {
    // 1. Gather Inputs
    const monthlyBillValue = bill || 0;
    const kwhRateValue = kwhRate || 15;

    // 2. Base Calculations
    const activeKWh = monthlyBillValue / kwhRateValue;
    const dailyKwh = activeKWh / 30;
    const baseTargetSystemSizeKwp = (dailyKwh / 4.2) * 0.55; // 4.2 baseline peak sun hours in Cavite
    const targetSystemSizeKwp = baseTargetSystemSizeKwp * 2.5; // Multiplied recommended system size to 2.5

    // Step One: Baseline Consumption Calculation
    const targetKWh = monthlyBillValue / 15;

    // Step Two: Calculate Base Investment (Updated +20% Targets)
    const calculateBaseInvestment = (kWh: number): number | string => {
      if (kWh >= 2733.33) {
        return "Off Grid - 0 bill";
      } else if (kWh > 1666.67) {
        return 696000 + ((kWh - 1666.67) * 264);
      } else if (kWh > 1066.67) {
        return 588000 + ((kWh - 1066.67) * 180);
      } else if (kWh > 800.00) {
        return 468000 + ((kWh - 800.00) * 450);
      } else if (kWh > 533.33) {
        return 420000 + ((kWh - 533.33) * 180);
      } else if (kWh > 266.67) {
        return 276000 + ((kWh - 266.67) * 540);
      } else if (kWh > 133.33) {
        return 204000 + ((kWh - 133.33) * 540);
      } else {
        return kWh * 1530;
      }
    };

    const baseInvestment = calculateBaseInvestment(targetKWh);

    // Step Three: Rate Proportional Adjustment
    const totalEstInvestment = typeof baseInvestment === 'number'
      ? baseInvestment * (kwhRateValue / 15)
      : baseInvestment;

    // Sizing logic for Inverter Aircon based on target system size (HP)
    let airconHP = '1.5 HP';
    if (targetSystemSizeKwp >= 8.0) {
      airconHP = '3.0 HP (Multi-split)';
    } else if (targetSystemSizeKwp >= 5.5) {
      airconHP = '2.5 HP';
    } else if (targetSystemSizeKwp >= 3.5) {
      airconHP = '2.0 HP';
    } else if (targetSystemSizeKwp >= 2.0) {
      airconHP = '1.5 HP';
    } else if (targetSystemSizeKwp >= 1.0) {
      airconHP = '1.0 HP';
    } else {
      airconHP = '0.75 HP';
    }

    // Visually map Daytime (Direct Solar) and Nighttime (Battery Backup) allocations
    const panelCost = typeof totalEstInvestment === 'number' ? Math.round(totalEstInvestment * 0.35) : "Custom Layout";
    const inverterCost = typeof totalEstInvestment === 'number' ? Math.round(totalEstInvestment * 0.15) : "Custom Hybrid/Off-Grid";
    const batteryCost = typeof totalEstInvestment === 'number' ? Math.round(totalEstInvestment * 0.40) : "Custom Bank";
    const systemBalanceCost = typeof totalEstInvestment === 'number' ? Math.round(totalEstInvestment * 0.10) : "Standard/Custom BOS";

    // 4. Return on Investment Metrics (Near-5 Plan Adjusted ROI Schedule)
    let monthlySavings = 0;
    let roiString = '';
    
    if (typeof totalEstInvestment === 'number') {
      monthlySavings = monthlyBillValue * 0.45; // Assumes 45% standard daytime usage shift offset
    } else {
      monthlySavings = monthlyBillValue;
    }

    if (monthlyBillValue <= 0) {
      roiString = 'N/A';
    } else if (monthlyBillValue <= 4000) {
      roiString = '2 Years, 2 Months';
    } else if (monthlyBillValue <= 8000) {
      roiString = '2 Years, 10 Months';
    } else if (monthlyBillValue <= 12000) {
      roiString = '3 Years, 5 Months';
    } else if (monthlyBillValue <= 16000) {
      roiString = '3 Years, 9 Months';
    } else if (monthlyBillValue <= 25000) {
      roiString = '4 Years, 0 Months';
    } else if (monthlyBillValue <= 40000) {
      roiString = '4 Years, 6 Months';
    } else {
      roiString = '4 Years, 11 Months';
    }

    return {
      activeKWh,
      dailyKwh,
      targetSystemSizeKwp,
      panelCost,
      inverterCost,
      batteryCost,
      systemBalanceCost,
      totalEstInvestment,
      monthlySavings,
      roiString,
      panelsNeeded: Math.round(targetSystemSizeKwp / 0.55),
      airconHP
    };
  }, [bill, kwhRate]);

  const generatePDFInstance = (customName?: string, customEmail?: string, customPhone?: string) => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();
    
    const clientName = customName || leadInfo.name || 'Valued Client';
    const clientEmail = customEmail || leadInfo.email;
    const clientPhone = customPhone || leadInfo.phone;
    
    // Top Accent colored bar (Deep Purple #8A2BE2)
    doc.setFillColor(138, 43, 226); 
    doc.rect(0, 0, 210, 8, 'F');
    
    // Header Grid Column layout
    // Title Left, Brand Right
    doc.setTextColor(138, 43, 226); // Purple logo text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('LAS SOLAR SYSTEM OVERVIEW', 15, 24);
    
    doc.setTextColor(17, 24, 39); // Deep Charcoal Title (#111827)
    doc.setFontSize(18);
    doc.text('Custom Solar Optimization Report', 15, 32);
    
    // Brand Hotline info on right
    doc.setTextColor(100, 116, 139); // Slate grayish text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('Official System Assessment', 195, 24, { align: 'right' });
    doc.setTextColor(138, 43, 226);
    doc.setFont('helvetica', 'bold');
    doc.text('Hotline: 0917 308 5095', 195, 29, { align: 'right' });
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('www.lassolar.com', 195, 34, { align: 'right' });

    // Decorative Separator line
    doc.setDrawColor(229, 231, 235); // border-slate-200
    doc.setLineWidth(0.5);
    doc.line(15, 39, 195, 39);

    // Client Metadata Box (F8FAFC)
    doc.setFillColor(248, 250, 252);
    doc.rect(15, 43, 180, 25, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.rect(15, 43, 180, 25, 'D');

    // Metadata Key-Values inside the box (spaced evenly at 20, 80, 140 offsets)
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    
    doc.text('PREPARED FOR:', 20, 50);
    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(clientName.toUpperCase(), 20, 55);

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('CONTACT DETAILS:', 80, 50);
    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Email: ${clientEmail || 'N/A'}`, 80, 55);
    doc.text(`Phone: ${clientPhone || 'N/A'}`, 80, 60);

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('REPORT DATE:', 140, 50);
    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(date, 140, 56);

    const startYValue = 80;
    
    // Add colored margin visual badge for Section Heads
    doc.setFillColor(138, 43, 226); // Purple accent badge
    doc.rect(15, startYValue - 3.2, 3, 3.5, 'F');
    
    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('1. Core Summary & Calculated Input Parameters', 21, startYValue);
    
    autoTable(doc, {
      startY: startYValue + 3,
      margin: { left: 15, right: 15 },
      styles: { fontSize: 8, font: 'helvetica', cellPadding: 2.5, lineColor: [241, 245, 249], lineWidth: 0.5 },
      head: [['Assessment Metric', 'Strategic Target Valuation']],
      body: [
        ['Average Monthly Electricity Bill', `PHP ${bill.toLocaleString()}`],
        ['Tariff / Electricity Rate', `PHP ${kwhRate}/kWh`],
        ['Recommended Solar Ingress Size', `${results.targetSystemSizeKwp.toFixed(2)} kWp`],
        ['Estimated Monocrystalline Panel Array (620W)', `${results.panelsNeeded} Solar Modules`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [26, 26, 26], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
      columnStyles: {
        0: { cellWidth: 100, fontStyle: 'bold', textColor: [71, 85, 105] },
        1: { cellWidth: 80, halign: 'right', fontStyle: 'bold', textColor: [17, 24, 39] }
      }
    });

    // Section 2: Load Capabilities
    const capY = (doc as any).lastAutoTable.finalY + 12;
    doc.setFillColor(138, 43, 226);
    doc.rect(15, capY - 3.2, 3, 3.5, 'F');
    
    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('2. Optimized Load Allocation Matrix', 21, capY);

    autoTable(doc, {
      startY: capY + 3,
      margin: { left: 15, right: 15 },
      styles: { fontSize: 8, font: 'helvetica', cellPadding: 2.5, lineColor: [241, 245, 249], lineWidth: 0.5 },
      head: [['Daytime Peak Hours (Direct Solar Energy)', 'Nighttime Base Hours (Intelligent Battery Backup)']],
      body: [
        [`Premium Inverter Air-Conditioner (${results.airconHP})`, 'LED System/Ambient Lights (~30 Watt Load)'],
        ['Standard Family Refrigerator (~150 Watt Load)', 'High-Speed Electric Circulation Fan (~55 Watt Load)'],
        ['Personal Laptop / Workspace Monitor (~80 W)', 'Home Entertainment TV System (~100 Watt Load)'],
        ['High-Speed Electric Fan (~55 W)', 'Broadband Storage Router (~25 Watt Load)'],
        ['Automated Washing Machine (Recommended Daytime Run)', 'Portable Smart Charging Sockets'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [26, 26, 26], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
      columnStyles: {
        0: { cellWidth: 90, textColor: [51, 65, 85] },
        1: { cellWidth: 90, textColor: [51, 65, 85] }
      }
    });

    // Section 3: Financial Statement
    const finY = (doc as any).lastAutoTable.finalY + 12;
    doc.setFillColor(138, 43, 226);
    doc.rect(15, finY - 3.2, 3, 3.5, 'F');
    
    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('3. Strategic Financial Valuation Outline', 21, finY);

    autoTable(doc, {
      startY: finY + 3,
      margin: { left: 15, right: 15 },
      styles: { fontSize: 8, font: 'helvetica', cellPadding: 2.5, lineColor: [241, 245, 249], lineWidth: 0.5 },
      head: [['Itemized Expense Matrix & Material Specification', 'Estimated Project Value']],
      body: [
        ['Grade Tier-1 High-Efficiency Mono Solar Panels', typeof results.panelCost === 'number' ? `PHP ${results.panelCost.toLocaleString()}` : results.panelCost],
        ['Premium Smart Hybrid Inverter Control System', typeof results.inverterCost === 'number' ? `PHP ${results.inverterCost.toLocaleString()}` : results.inverterCost],
        ['Intelligent Lithium Iron Phosphate (LiFePO4) Battery Storage', typeof results.batteryCost === 'number' ? `PHP ${results.batteryCost.toLocaleString()}` : results.batteryCost],
        ['Balance of System (High-Conductivity Wiring, Rail Mounts, Safety Breakers)', typeof results.systemBalanceCost === 'number' ? `PHP ${results.systemBalanceCost.toLocaleString()}` : results.systemBalanceCost],
        [
          { content: 'Total Estimated Capital Project Investment (CapEx Sum)', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], textColor: [17, 24, 39] } }, 
          { content: typeof results.totalEstInvestment === 'number' ? `PHP ${results.totalEstInvestment.toLocaleString()}` : results.totalEstInvestment, styles: { fontStyle: 'bold', fillColor: [248, 250, 252], textColor: [17, 24, 39], halign: 'right' } }
        ],
        [
          { content: 'Anticipated Financial Amortization Payback Duration (ROI)', styles: { fontStyle: 'bold', fillColor: [236, 253, 245], textColor: [6, 95, 70] } }, 
          { content: results.roiString, styles: { fontStyle: 'bold', fillColor: [236, 253, 245], textColor: [6, 95, 70], halign: 'right' } }
        ],
      ],
      theme: 'grid',
      headStyles: { fillColor: [26, 26, 26], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
      columnStyles: {
        0: { cellWidth: 120, textColor: [71, 85, 105] },
        1: { cellWidth: 60, halign: 'right', fontStyle: 'bold', textColor: [17, 24, 39] }
      }
    });

    // Footer Clause
    const footY = (doc as any).lastAutoTable.finalY + 10;
    doc.setDrawColor(241, 244, 249);
    doc.setLineWidth(0.5);
    doc.line(15, footY, 195, footY);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(115, 115, 115);
    const disclaimer = doc.splitTextToSize(
      'Notice & Non-Binding Disclaimer: Calculated projections are model estimates produced on average environmental indicators. A standard physical technical site engineering inspection from a certified installation lead is required to determine exact physical array orientations, structural details, and solar yield projections.',
      180
    );
    doc.text(disclaimer, 15, footY + 4);

    return doc;
  };

  const generatePDF = () => {
    const doc = generatePDFInstance();
    const pdfName = leadInfo.name ? leadInfo.name.replace(/\s+/g, '_') : 'Valued_Client';
    doc.save(`Las_Solar_Report_${pdfName}.pdf`);
  };

  const handleDownloadClick = () => {
    setShowLeadGate(true);
  };

  const handleLeadSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (leadInfo.name && leadInfo.phone) {
      setIsSaving(true);
      try {
        // Step 1: Generate the PDF document local instance
        const doc = generatePDFInstance(leadInfo.name, leadInfo.email, leadInfo.phone);

        // Step 2: Upload the generated PDF as a File wrapper to Supabase Storage using robust uploadImage helper
        let docPublicUrl = null;
        try {
          const pdfBlob = doc.output('blob');
          const safeName = leadInfo.name ? leadInfo.name.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'client';
          
          const pdfFile = new File([pdfBlob], `solar_report_${Date.now()}_${safeName}.pdf`, {
            type: 'application/pdf'
          });

          docPublicUrl = await uploadImage(pdfFile, 'bills');
          if (docPublicUrl) {
            localStorage.setItem('las_solar_last_report_url', docPublicUrl);
            try {
              const reportsMap = JSON.parse(localStorage.getItem('las_solar_reports_by_contact') || '{}');
              const emailKey = leadInfo.email ? leadInfo.email.trim().toLowerCase() : '';
              const phoneKey = leadInfo.phone ? leadInfo.phone.replace(/\D/g, '') : '';
              if (emailKey) reportsMap[emailKey] = docPublicUrl;
              if (phoneKey) reportsMap[phoneKey] = docPublicUrl;
              localStorage.setItem('las_solar_reports_by_contact', JSON.stringify(reportsMap));
            } catch (cacheErr) {
              console.error('Error writing reports map cache:', cacheErr);
            }
          }
        } catch (uploadErr) {
          console.error('Error generating/uploading PDF report raw asset in calculator:', uploadErr);
        }

        // Step 3: Handle Database Persistence elegantly
        // Check if there is a Form First lead context we can update (Scenario A)
        const formStored = localStorage.getItem('las_solar_form_lead_context');
        let existingFormLeadId = null;
        let formStoredBillUrl = '';
        let formStoredAddress = '';
        if (formStored) {
          try {
            const parsed = JSON.parse(formStored);
            // If parsed.dbLeadId is present, we definitely update that row (Scenario A: Form Filled First)
            if (parsed.dbLeadId) {
              existingFormLeadId = parsed.dbLeadId;
            }
            if (parsed.billUrl !== undefined && parsed.billUrl !== null) {
              formStoredBillUrl = parsed.billUrl;
            }
            if (parsed.formattedAddress) {
              formStoredAddress = parsed.formattedAddress;
            } else if (parsed.address) {
              formStoredAddress = parsed.address;
            }
          } catch (err) {
            console.error('Error parsing form lead context in calculator submit:', err);
          }
        }

        let returnedLeadId = null;
        let finalLeadIdToUpdate = existingFormLeadId;
        let finalBillUrlToMerge = formStoredBillUrl;
        let finalAddressToMerge = formStoredAddress;

        if (!isSupabaseConfigured) {
          // OFFLINE / LOCAL SANDBOX DATABASE MATCHING & OPERATIONS:
          const fallbackStr = localStorage.getItem('las_solar_leads_fallback');
          const fallbackLeads = fallbackStr ? JSON.parse(fallbackStr) : [
            {
              id: 'demo-1',
              name: 'Juan Dela Cruz',
              phone: '09171234567',
              email: 'juan@example.com',
              address: '123 Rizal Ave, Quezon City',
              property_type: 'Residential (House & Lot)',
              utility_provider: 'Meralco',
              monthly_bill: '₱8,500',
              status: 'New',
              created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
              goal: 'Reduce Monthly Electricity Bill'
            },
            {
              id: 'demo-2',
              name: 'Maria Santos',
              phone: '09187654321',
              email: 'maria@example.com',
              address: '456 Taft Ave, Manila',
              property_type: 'Commercial (Retail/Office)',
              utility_provider: 'Meralco',
              monthly_bill: '₱24,000',
              status: 'Contacted',
              created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
              goal: 'Eco-Friendly / Sustainability Goals'
            }
          ];

          if (finalLeadIdToUpdate) {
            const matchedLocal = fallbackLeads.find((l: any) => l.id === finalLeadIdToUpdate);
            if (matchedLocal) {
              finalBillUrlToMerge = matchedLocal.bill_url || '';
              finalAddressToMerge = matchedLocal.address || '';
            }
          } else {
            const emailMatch = leadInfo.email ? leadInfo.email.trim().toLowerCase() : '';
            const phoneMatchRaw = leadInfo.phone ? leadInfo.phone.trim() : '';
            const phoneMatchDigits = phoneMatchRaw.replace(/\D/g, '');

            const matchIndex = fallbackLeads.findIndex((l: any) => 
              (emailMatch && l.email?.toLowerCase() === emailMatch) ||
              (phoneMatchDigits && (l.phone || '').replace(/\D/g, '').includes(phoneMatchDigits)) ||
              (!emailMatch && !phoneMatchDigits && leadInfo.name && l.name?.trim().toLowerCase() === leadInfo.name.trim().toLowerCase())
            );

            if (matchIndex !== -1) {
              finalLeadIdToUpdate = fallbackLeads[matchIndex].id;
              finalBillUrlToMerge = fallbackLeads[matchIndex].bill_url || '';
              finalAddressToMerge = fallbackLeads[matchIndex].address || '';
            }
          }

          if (finalLeadIdToUpdate || hasFormContext) {
            // Scenario A: Form Filled first, then Calculator completed locally
            const existingUrls = finalBillUrlToMerge ? finalBillUrlToMerge.split(',').map(url => url.trim()).filter(Boolean) : [];
            const onlyBills = existingUrls.filter(url => !url.toLowerCase().includes('solar_report_'));
            const finalUrls = [...onlyBills];
            if (docPublicUrl) {
              finalUrls.push(docPublicUrl);
            }
            const combinedBillUrl = finalUrls.join(',');

            const finalMergedAddress = (() => {
              const addressStr = finalAddressToMerge || '';
              const specsIndex = addressStr.indexOf('[Inverter Location Specs]');
              if (specsIndex !== -1) {
                const originalSpecsStr = addressStr.substring(specsIndex);
                const rawBaseAddress = leadInfo.address || addressStr.substring(0, specsIndex).trim();
                return `${rawBaseAddress}\n\n${originalSpecsStr}`;
              }
              return leadInfo.address;
            })();

            if (finalLeadIdToUpdate) {
              const matchIdx = fallbackLeads.findIndex((l: any) => l.id === finalLeadIdToUpdate);
              if (matchIdx !== -1) {
                fallbackLeads[matchIdx] = {
                  ...fallbackLeads[matchIdx],
                  name: leadInfo.name,
                  email: leadInfo.email,
                  phone: leadInfo.phone,
                  address: finalMergedAddress,
                  monthly_bill: `₱${bill.toLocaleString()} (Calculator Assessed)`,
                  goal: 'Detailed Inquiry + Calculator ROI Report',
                  bill_url: combinedBillUrl,
                  status: 'New'
                };
              }
              returnedLeadId = finalLeadIdToUpdate;
            } else {
              const newMockId = `local-lead-${Date.now()}`;
              fallbackLeads.unshift({
                id: newMockId,
                name: leadInfo.name,
                email: leadInfo.email,
                phone: leadInfo.phone,
                address: leadInfo.address,
                monthly_bill: `₱${bill.toLocaleString()} (Calculator Assessed)`,
                goal: 'Detailed Inquiry + Calculator ROI Report',
                bill_url: docPublicUrl,
                status: 'New',
                created_at: new Date().toISOString()
              });
              returnedLeadId = newMockId;
            }

            localStorage.setItem('las_solar_leads_fallback', JSON.stringify(fallbackLeads));

            // Clear contexts since both have been submitted
            localStorage.removeItem('las_solar_form_lead_context');
            localStorage.removeItem('las_solar_calculator_context');
            sessionStorage.removeItem('las_solar_trigger_prefill_form');
          } else {
            // Scenario B: Store calculator context to allow pre-filling in local storage
            const calcContext = {
              name: leadInfo.name,
              email: leadInfo.email,
              phone: leadInfo.phone,
              address: leadInfo.address,
              bill: bill,
              kwhRate: kwhRate,
              dbLeadId: null,
              reportUrl: docPublicUrl,
              completedCalculator: true
            };
            localStorage.setItem('las_solar_calculator_context', JSON.stringify(calcContext));
          }
        } else {
          // If a lead ID is present, fetch the latest database record to ensure any uploaded bill url is NOT lost due to stale local contexts
          if (finalLeadIdToUpdate) {
            try {
              const { data, error } = await supabase
                .from('leads')
                .select('id, bill_url, address')
                .eq('id', finalLeadIdToUpdate)
                .limit(1);
              if (!error && data && data.length > 0) {
                finalBillUrlToMerge = data[0].bill_url || '';
                finalAddressToMerge = data[0].address || '';
              }
            } catch (dbErr) {
              console.error('Database pre-fetch details exception in calculator:', dbErr);
            }
          }

          // Advanced database lookup fallback if context ID is lost
          if (!finalLeadIdToUpdate) {
            try {
              const emailMatch = leadInfo.email ? leadInfo.email.trim().toLowerCase() : '';
              const phoneMatchRaw = leadInfo.phone ? leadInfo.phone.trim() : '';
              const phoneMatchDigits = phoneMatchRaw.replace(/\D/g, '');

              let matchedRecord = null;

              // 1. Try matching by case-insensitive email
              if (emailMatch) {
                const { data } = await supabase
                  .from('leads')
                  .select('id, bill_url, address')
                  .eq('email', emailMatch)
                  .order('created_at', { ascending: false })
                  .limit(1);
                if (data && data.length > 0) {
                  matchedRecord = data[0];
                }
              }

              // 2. Try match by phone digit-only similarity to avoid formatting differences
              if (!matchedRecord && phoneMatchDigits) {
                const { data } = await supabase
                  .from('leads')
                  .select('id, bill_url, address, phone')
                  .order('created_at', { ascending: false })
                  .limit(20);
                
                if (data && data.length > 0) {
                  matchedRecord = data.find(item => {
                    const dbPhoneDigits = (item.phone || '').replace(/\D/g, '');
                    return dbPhoneDigits && (dbPhoneDigits.includes(phoneMatchDigits) || phoneMatchDigits.includes(dbPhoneDigits));
                  });
                }
              }

              // 3. Try exact name match as fallback
              if (!matchedRecord && leadInfo.name) {
                const { data } = await supabase
                  .from('leads')
                  .select('id, bill_url, address')
                  .eq('name', leadInfo.name.trim())
                  .order('created_at', { ascending: false })
                  .limit(1);
                if (data && data.length > 0) {
                  matchedRecord = data[0];
                }
              }

              if (matchedRecord) {
                finalLeadIdToUpdate = matchedRecord.id;
                finalBillUrlToMerge = matchedRecord.bill_url || '';
                finalAddressToMerge = matchedRecord.address || '';
              }
            } catch (lookupErr) {
              console.error('Advanced fallback lookup failed in calculator submit:', lookupErr);
            }
          }

          if (finalLeadIdToUpdate || hasFormContext) {
            // Scenario A: Form Filled first, then Calculator completed.
            // UPDATE the existing lead record in the database, attaching the newly generated report URL!
            // Parse and deduplicate URLs to keep the electric bill but prevent multiple calculator reports
            const existingUrls = finalBillUrlToMerge ? finalBillUrlToMerge.split(',').map(url => url.trim()).filter(Boolean) : [];
            const onlyBills = existingUrls.filter(url => 
              !url.toLowerCase().includes('solar_report_')
            );
            const finalUrls = [...onlyBills];
            if (docPublicUrl) {
              finalUrls.push(docPublicUrl);
            }
            const combinedBillUrl = finalUrls.join(',');

            try {
              const finalMergedAddress = (() => {
                const addressStr = finalAddressToMerge || '';
                const specsIndex = addressStr.indexOf('[Inverter Location Specs]');
                if (specsIndex !== -1) {
                  const originalSpecsStr = addressStr.substring(specsIndex);
                  const rawBaseAddress = leadInfo.address || addressStr.substring(0, specsIndex).trim();
                  return `${rawBaseAddress}\n\n${originalSpecsStr}`;
                }
                return leadInfo.address;
              })();

              if (finalLeadIdToUpdate) {
                const { error } = await supabase
                  .from('leads')
                  .update({
                    name: leadInfo.name,
                    email: leadInfo.email,
                    phone: leadInfo.phone,
                    // Preserve the formatted details (with Inverter Location Specs) if present, otherwise use latest address string
                    address: finalMergedAddress,
                    monthly_bill: `₱${bill.toLocaleString()} (Calculator Assessed)`,
                    goal: 'Detailed Inquiry + Calculator ROI Report',
                    bill_url: combinedBillUrl,
                    status: 'New'
                  })
                  .eq('id', finalLeadIdToUpdate);

                if (error) {
                  console.error('Database lead update returned query error object:', error);
                  throw error;
                }
                returnedLeadId = finalLeadIdToUpdate;
              } else {
                // Fallback: If finalLeadIdToUpdate is null but hasFormContext is true, insert a clean backup lead with the PDF report linked.
                const backupId = generateUUID();
                const { error } = await supabase
                  .from('leads')
                  .insert({
                    id: backupId,
                    name: leadInfo.name,
                    email: leadInfo.email,
                    phone: leadInfo.phone,
                    address: leadInfo.address,
                    monthly_bill: `₱${bill.toLocaleString()} (Calculator Assessed)`,
                    goal: 'Detailed Inquiry + Calculator ROI Report',
                    bill_url: docPublicUrl,
                    status: 'New'
                  });

                if (error) {
                  console.error('Database lead fallback insert returned query error object:', error);
                  throw error;
                }
                returnedLeadId = backupId;
              }
            } catch (dbErr) {
              console.error('Database lead update/insert transaction execution failed:', dbErr);
              returnedLeadId = finalLeadIdToUpdate;
            }

            // Clear both contexts since both Form and Calculator have been fully submitted/integrated!
            localStorage.removeItem('las_solar_form_lead_context');
            localStorage.removeItem('las_solar_calculator_context');
            sessionStorage.removeItem('las_solar_trigger_prefill_form');
          } else {
            // Scenario B / Calculator Only First:
            // Note: Even though the user downloaded the document, the admin will NOT receive a copy of it
            // until the user fully completes and submits the subsequent form.
            // Therefore, we DO NOT insert a database row yet. We only cache it in local context for Step 2 pre-fill.
            returnedLeadId = null;

            // Store calculator context to allow pre-filling in the Detailed Quote Form (Scenario B)
            const calcContext = {
              name: leadInfo.name,
              email: leadInfo.email,
              phone: leadInfo.phone,
              address: leadInfo.address,
              bill: bill,
              kwhRate: kwhRate,
              dbLeadId: null,
              reportUrl: docPublicUrl,
              completedCalculator: true
            };
            localStorage.setItem('las_solar_calculator_context', JSON.stringify(calcContext));
          }
        }

        window.dispatchEvent(new Event('las-solar-context-updated'));

        // Step 4: Download PDF to client as well filesave
        const pdfName = leadInfo.name ? leadInfo.name.replace(/\s+/g, '_') : 'Valued_Client';
        doc.save(`Las_Solar_Report_${pdfName}.pdf`);

        setIsSuccess(true);
        setTimeout(() => {
          setShowLeadGate(false);
          setIsSuccess(false);
        }, 6000); // Give user enough time to see the pre-fill CTA inside success modal
      } catch (err) {
        console.error('Error saving lead:', err);
        alert('There was an error saving your request. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="bg-zinc-900 rounded-[3rem] shadow-2xl overflow-hidden border border-zinc-800 p-1">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-1 bg-zinc-800/20">
        
        {/* Left Sidebar: Inputs */}
        <div className="lg:col-span-1 bg-zinc-800/50 p-8 flex flex-col border-r border-zinc-800">
          <div className="mb-10 text-left pt-2">
            <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight mb-3">Setup Calculator</h2>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Define your parameters to generate a custom system sizing report.
            </p>
          </div>

          <div className="space-y-8">
            {hasFormContext && (
              <div className="p-5 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl flex items-start gap-3 text-left">
                <Info className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">Pre-filled from Inquiry</span>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    We've auto-loaded your monthly bill tier and contact details. Please <strong className="text-white font-bold">double-check</strong> the values above and adjust them if needed before downloading your report.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Monthly Electric Bill (₱)</label>
              <div className="group transition-all focus-within:ring-2 focus-within:ring-app-purple rounded-2xl">
                <input 
                  type="number" 
                  value={bill || ''}
                  onChange={(e) => {
                    setBill(Number(e.target.value));
                    isManuallyEditedRef.current = true;
                  }}
                  className="w-full bg-zinc-900 border border-zinc-700 text-white font-display font-black text-xl px-6 py-5 rounded-2xl focus:outline-none focus:border-app-purple"
                  placeholder="e.g. 13000"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Price per kWh (₱)</label>
              <div className="group transition-all focus-within:ring-2 focus-within:ring-app-purple rounded-2xl">
                <input 
                  type="number" 
                  step="0.1"
                  value={kwhRate}
                  onChange={(e) => setKwhRate(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-700 text-white font-display font-black text-xl px-6 py-5 rounded-2xl focus:outline-none focus:border-app-purple"
                />
              </div>
            </div>

            <button 
              onClick={() => {}} // Calculated automatically via useMemo, but button can trigger focus or animation
              className="w-full bg-app-purple text-white font-black uppercase tracking-widest text-sm py-6 rounded-2xl hover:bg-black hover:text-white border border-transparent hover:border-app-purple transition-all shadow-xl shadow-purple-900/40 active:scale-95"
            >
              Calculate My Setup
            </button>

            <div className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
              <Info className="text-app-purple shrink-0" size={16} />
              <p className="text-[10px] text-zinc-500 font-medium leading-relaxed italic">
                Calculations based on 4.2h average daily peak sun hours in the Philippines.
              </p>
            </div>
          </div>
        </div>

        {/* Right Workspace: Dynamic Results */}
        <div className="lg:col-span-2 p-8 lg:p-12 space-y-12">
          
          {/* Panel A: What Can I Run? */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 border-b border-zinc-800 pb-4">Panel A: What Can I Run?</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Daytime List */}
              <div className="bg-zinc-800/30 p-6 rounded-3xl border border-zinc-800/80">
                <div className="flex items-center justify-between gap-2 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-app-purple/20 text-app-purple rounded-lg">
                      <Zap size={18} />
                    </div>
                    <span className="font-black text-white uppercase text-[11px] tracking-widest">Daytime (Direct Solar)</span>
                  </div>
                  <span className="text-[10px] bg-app-purple/10 text-app-purple px-2.5 py-1 rounded-md font-black uppercase tracking-widest">
                    {typeof results.totalEstInvestment === 'number' ? `₱${Math.round(results.totalEstInvestment * 0.60).toLocaleString()}` : 'Custom'}
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Inverter Aircon', watt: results.airconHP },
                    { name: 'Refrigerator', watt: '~150 W' },
                    { name: 'Laptop + Monitor', watt: '~80 W' },
                    { name: 'Electric Fan', watt: '~55 W' },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                      <span className="text-zinc-300 text-xs font-medium">{item.name}</span>
                      <span className="text-app-purple text-[10px] font-black">{item.watt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nighttime List */}
              <div className="bg-zinc-800/30 p-6 rounded-3xl border border-zinc-800/80">
                <div className="flex items-center justify-between gap-2 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 text-white rounded-lg">
                      <Zap size={18} />
                    </div>
                    <span className="font-black text-white uppercase text-[11px] tracking-widest">Nighttime (Battery Backup)</span>
                  </div>
                  <span className="text-[10px] bg-white/10 text-white px-2.5 py-1 rounded-md font-black uppercase tracking-widest">
                    {typeof results.totalEstInvestment === 'number' ? `₱${Math.round(results.totalEstInvestment * 0.40).toLocaleString()}` : 'Custom'}
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'LED Lights', watt: '~30 W' },
                    { name: 'Electric Fan', watt: '~55 W' },
                    { name: 'Television', watt: '~100 W' },
                    { name: 'Wifi Router', watt: '~25 W' },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                      <span className="text-zinc-300 text-xs font-medium">{item.name}</span>
                      <span className="text-white text-[10px] font-black">{item.watt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Panel B: Estimated Investment Breakdown */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 border-b border-zinc-800 pb-4">Panel B: Estimated Investment Breakdown</h4>
            <div className="bg-zinc-900/50 rounded-[2rem] border border-zinc-800 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-zinc-800/50 border-b border-zinc-800">
                  <tr>
                    <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-zinc-500">Component</th>
                    <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-zinc-500 text-right">Est. Expense</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {[
                    { label: 'Solar Panels', val: results.panelCost },
                    { label: 'Hybrid Inverter', val: results.inverterCost },
                    { label: 'Lithium Battery Storage', val: results.batteryCost },
                    { label: 'Balance of System', val: results.systemBalanceCost },
                  ].map((row) => (
                    <tr key={row.label} className="group hover:bg-zinc-800/20 transition-colors">
                      <td className="px-8 py-5 text-sm text-zinc-300 font-medium">{row.label}</td>
                      <td className="px-8 py-5 text-sm text-white font-black text-right">
                        {typeof row.val === 'number' ? `₱${row.val.toLocaleString()}` : row.val}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-zinc-800/80">
                    <td className="px-8 py-6 text-sm font-black text-white uppercase tracking-widest">Total Estimated Investment</td>
                    <td className="px-8 py-6 text-2xl font-display font-black text-app-purple text-right">
                      {typeof results.totalEstInvestment === 'number' ? `₱${results.totalEstInvestment.toLocaleString()}` : results.totalEstInvestment}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Panel C: Financial Return Summary */}
          <div className="pt-4">
            <div className="bg-app-purple p-8 md:p-10 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group border border-white/10 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700"></div>
              
              <div className="relative z-10 text-center md:text-left">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 block mb-3">Calculated ROI Payback</span>
                <p className="text-4xl md:text-5xl font-display font-black text-white tracking-tighter leading-none italic">{results.roiString}</p>
                <div className="mt-4 space-y-1">
                  <p className="text-xs text-white/95 font-medium">
                    Est. Savings: <span className="font-black text-white">₱{Math.round(results.monthlySavings).toLocaleString()}/month</span>
                  </p>
                  <p className="text-[9px] text-white/70 max-w-xs font-medium leading-normal italic">
                    * Pro tip: Higher energy consumption (kWh) profiles translate to greater monthly peso savings and faster investment amortization.
                  </p>
                </div>
              </div>

              <button 
                onClick={handleDownloadClick}
                className="relative z-10 bg-black hover:bg-black/80 text-white px-8 py-5 rounded-2xl flex items-center gap-3 border border-white/10 transition-all active:scale-95 shadow-2xl"
              >
                <Download size={22} className="text-app-purple" />
                <span className="font-black uppercase text-sm tracking-widest">Download PDF Report</span>
              </button>
            </div>
            
            <p className="text-[9px] text-center mt-6 text-zinc-600 uppercase tracking-widest font-black flex items-center justify-center gap-2">
              <CheckCircle2 size={10} className="text-app-purple" />
              Preliminary Assessment • Standard 25-Year Performance Warranty estimation
            </p>
          </div>

        </div>
      </div>

      {/* Lead Gate Modal */}
      <AnimatePresence>
        {showLeadGate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => !isSaving && setShowLeadGate(false)}
               className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-zinc-900 p-8 md:p-12 rounded-[3.5rem] shadow-2xl relative z-10 max-w-lg w-full border border-zinc-800"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-800/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
              
              {!isSaving && (
                <button onClick={() => setShowLeadGate(false)} className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              )}

              {isSuccess ? (
                <div className="text-center py-4 w-full">
                  <div className="bg-emerald-800/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-800/20">
                    <CheckCircle2 className="text-emerald-500" size={36} />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Report Ready!</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed max-w-sm mx-auto mb-6">
                    Your custom solar optimization report is downloading. Our engineering team has received a copy.
                  </p>

                  <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl text-left shadow-lg">
                    <span className="text-[9px] font-black uppercase tracking-widest text-app-purple block mb-1">Step 2: Custom Engineering</span>
                    <h4 className="text-white font-bold text-xs uppercase tracking-wide mb-1.5">Get a Full Engineering Proposal</h4>
                    <p className="text-zinc-400 text-[11px] leading-relaxed mb-4">
                      Turn this preliminary analysis into an engineering-approved project document featuring custom satellite roof shadows and inverter placement configurations. Pre-fill the form now.
                    </p>
                    <button
                      onClick={() => {
                        sessionStorage.setItem('las_solar_trigger_prefill_form', 'true');
                        window.dispatchEvent(new Event('las-solar-context-updated'));
                        setShowLeadGate(false);
                        const element = document.getElementById('request-quote-form');
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="w-full text-center bg-app-purple hover:bg-white hover:text-black text-white font-black uppercase text-[10px] py-3 rounded-xl tracking-widest transition-all active:scale-95"
                    >
                      Pre-Fill Proposal Form →
                    </button>
                  </div>
                </div>
              ) : isSaving && hasFormContext ? (
                <div className="text-center py-12 space-y-6">
                  <Loader2 className="animate-spin text-app-purple mx-auto" size={48} />
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">Generating Report</h3>
                  <p className="text-zinc-400 text-xs max-w-sm mx-auto leading-relaxed">
                    We are compiling your personalized ROI breakdown, secure PDF report, and syncing with your previous design inquiry...
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-10">
                    <div className="bg-emerald-800/20 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-800/30">
                        <TrendingUp className="text-emerald-500" size={32} />
                    </div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-3">Get Your ROI Report</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed px-4">
                      Submit your details to instantly receive the itemized breakdown and power capability map.
                    </p>
                  </div>

                  <form onSubmit={handleLeadSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-2">Full Name</label>
                      <input 
                        required
                        type="text" 
                        value={leadInfo.name}
                        onChange={(e) => setLeadInfo({...leadInfo, name: e.target.value})}
                        placeholder="Juan De La Cruz"
                        className="w-full px-5 py-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl focus:border-emerald-800 focus:outline-none transition-all text-white text-sm" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-2">Email Address</label>
                      <input 
                        required
                        type="email" 
                        value={leadInfo.email}
                        onChange={(e) => setLeadInfo({...leadInfo, email: e.target.value})}
                        placeholder="juan.delacruz@email.com"
                        className="w-full px-5 py-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl focus:border-emerald-800 focus:outline-none transition-all text-white text-sm" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-2">Mobile Number</label>
                      <input 
                        required
                        type="tel" 
                        value={leadInfo.phone}
                        onChange={(e) => setLeadInfo({...leadInfo, phone: e.target.value})}
                        placeholder="0917 123 4567"
                        className="w-full px-5 py-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl focus:border-emerald-800 focus:outline-none transition-all text-white text-sm" 
                      />
                    </div>
                    <div className="space-y-1.5 mb-6">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-2">Property Address / Installation Location</label>
                      <input 
                        required
                        type="text" 
                        value={leadInfo.address}
                        onChange={(e) => setLeadInfo({...leadInfo, address: e.target.value})}
                        placeholder="e.g. Brgy. Burol, Dasmariñas, Cavite"
                        className="w-full px-5 py-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl focus:border-emerald-800 focus:outline-none transition-all text-white text-sm" 
                      />
                    </div>
                    <button 
                      disabled={isSaving}
                      type="submit" 
                      className="w-full bg-emerald-800 text-white font-black uppercase tracking-[0.2em] text-sm py-4.5 rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/40"
                    >
                      {isSaving ? (
                        <>Preparing Report... <Loader2 className="animate-spin ml-2 inline" size={16} /></>
                      ) : (
                        <>Download My Report <Download size={16} className="ml-2 inline" /></>
                      )}
                    </button>
                  </form>
                  <p className="text-[10px] text-center mt-6 text-zinc-600 uppercase tracking-widest font-black">Official Assessment • Secure Download</p>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


