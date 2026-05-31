import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, CheckCircle2, Upload, Send, Loader2, Info, Zap } from 'lucide-react';
import { supabase, isSupabaseConfigured, uploadImage } from '../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function getBillFromBracket(bracket: string): number {
  if (!bracket) return 13000;
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

const calculateResultsForBill = (billVal: number) => {
  const kwhRateValue = 15;

  const activeKWh = billVal / kwhRateValue;
  const dailyKwh = activeKWh / 30;
  const baseTargetSystemSizeKwp = (dailyKwh / 4.2) * 0.55; 
  const targetSystemSizeKwp = baseTargetSystemSizeKwp * 2.5; 

  const targetKWh = billVal / 15;

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

  const totalEstInvestment = typeof baseInvestment === 'number'
    ? baseInvestment * (kwhRateValue / 15)
    : baseInvestment;

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

  const panelCost = typeof totalEstInvestment === 'number' ? Math.round(totalEstInvestment * 0.35) : "Custom Layout";
  const inverterCost = typeof totalEstInvestment === 'number' ? Math.round(totalEstInvestment * 0.15) : "Custom Hybrid/Off-Grid";
  const batteryCost = typeof totalEstInvestment === 'number' ? Math.round(totalEstInvestment * 0.40) : "Custom Bank";
  const systemBalanceCost = typeof totalEstInvestment === 'number' ? Math.round(totalEstInvestment * 0.10) : "Standard/Custom BOS";

  let monthlySavings = 0;
  let roiString = '';
  
  if (typeof totalEstInvestment === 'number') {
    monthlySavings = billVal * 0.45; 
  } else {
    monthlySavings = billVal;
  }

  if (billVal <= 0) {
    roiString = 'N/A';
  } else if (billVal <= 4000) {
    roiString = '2 Years, 2 Months';
  } else if (billVal <= 8000) {
    roiString = '2 Years, 10 Months';
  } else if (billVal <= 12000) {
    roiString = '3 Years, 5 Months';
  } else if (billVal <= 16000) {
    roiString = '3 Years, 9 Months';
  } else if (billVal <= 25000) {
    roiString = '4 Years, 0 Months';
  } else if (billVal <= 40000) {
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
};

const generatePDFForForm = (name: string, email: string, phone: string, billBracket: string) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();
  const billVal = getBillFromBracket(billBracket);
  const results = calculateResultsForBill(billVal);
  
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
  doc.text((name || 'VALUED CLIENT').toUpperCase(), 20, 55);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('CONTACT DETAILS:', 80, 50);
  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Email: ${email || 'N/A'}`, 80, 55);
  doc.text(`Phone: ${phone || 'N/A'}`, 80, 60);

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
       ['Avg. Monthly Bill Range (Form Chosen)', `${billBracket}`],
       ['Assessed Midpoint Bill Factor', `PHP ${billVal.toLocaleString()}`],
       ['Tariff / Electricity Rate', `PHP 15/kWh`],
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

interface QuoteFormProps {
  className?: string;
}

export default function QuoteForm({ className = "" }: QuoteFormProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isUploadingStep3, setIsUploadingStep3] = useState(false);
  const [hasCalcFirstContext, setHasCalcFirstContext] = useState(false);
  const [billUploadError, setBillUploadError] = useState('');

  const [formData, setFormData] = useState({
    propertyType: 'Residential (House & Lot)',
    name: '',
    email: '',
    phone: '',
    address: '',
    utilityProvider: '',
    monthlyBill: '',
    roofType: '',
    shading: '',
    goal: '',
    timeline: '',
    billFile: null as File | null,
    inverterSetupFile: null as File | null,
    inverterSetupUrl: '',
    inverterSetupFilename: '',
    inverterSetupFile1: null as File | null,
    inverterSetupFile2: null as File | null,
    inverterSetupUrl1: '',
    inverterSetupUrl2: '',
    inverterSetupFilename1: '',
    inverterSetupFilename2: '',
    billFilename: '',
    ocularVisitDate: '',
    ocularVisitTime: '9:00 AM - 12:00 PM',
    hasDesignatedInverterLocation: 'yes',
    inverterLocationDetails: '',
    panelBoardLocation: '',
    proposedInverterLocation: '',
    distanceMeters: ''
  });

  useEffect(() => {
    const checkCalculatorContext = () => {
      const stored = localStorage.getItem('las_solar_calculator_context');
      if (stored) {
        try {
          const context = JSON.parse(stored);
          if (context.completedCalculator) {
            setHasCalcFirstContext(true);
            
            // Map the calculated bill amount to the nearest available range
            let mappedBillRange = '';
            const billNum = Number(context.bill);
            if (billNum > 0) {
              if (billNum < 5000) {
                mappedBillRange = '₱1,000 – ₱4,000';
              } else if (billNum <= 8000) {
                mappedBillRange = '₱5,000 – ₱8,000';
              } else if (billNum <= 12000) {
                mappedBillRange = '₱9,000 – ₱12,000';
              } else if (billNum <= 16000) {
                mappedBillRange = '₱13,000 – ₱16,000';
              } else if (billNum <= 25000) {
                mappedBillRange = '₱17,000 – ₱25,000';
              } else if (billNum <= 40000) {
                mappedBillRange = '₱26,000 – ₱40,000';
              } else {
                mappedBillRange = '₱41,000 – Up';
              }
            }

            const triggerPrefill = sessionStorage.getItem('las_solar_trigger_prefill_form') === 'true';

            if (triggerPrefill) {
              setFormData({
                propertyType: 'Residential (House & Lot)',
                name: context.name || '',
                email: context.email || '',
                phone: context.phone || '',
                address: context.address || '',
                utilityProvider: '',
                monthlyBill: mappedBillRange || '',
                roofType: '',
                shading: '',
                goal: '',
                timeline: '',
                billFile: null as File | null,
                inverterSetupFile: null as File | null,
                inverterSetupUrl: '',
                inverterSetupFilename: '',
                inverterSetupFile1: null as File | null,
                inverterSetupFile2: null as File | null,
                inverterSetupUrl1: '',
                inverterSetupUrl2: '',
                inverterSetupFilename1: '',
                inverterSetupFilename2: '',
                billFilename: '',
                ocularVisitDate: '',
                ocularVisitTime: '9:00 AM - 12:00 PM',
                hasDesignatedInverterLocation: 'yes',
                inverterLocationDetails: '',
                panelBoardLocation: '',
                proposedInverterLocation: '',
                distanceMeters: ''
              });
              setIsSuccess(false);
              setStep(1);
              sessionStorage.removeItem('las_solar_trigger_prefill_form');
            } else {
              setFormData(prev => ({
                ...prev,
                // Prioritize latest calculator context details
                name: context.name || prev.name || '',
                email: context.email || prev.email || '',
                phone: context.phone || prev.phone || '',
                address: context.address || prev.address || '',
                monthlyBill: mappedBillRange || prev.monthlyBill || ''
              }));
              setIsSuccess(false);
            }
          }
        } catch (e) {
          console.error('Error parsing calculator context:', e);
        }
      } else {
        setHasCalcFirstContext(false);
      }
    };

    checkCalculatorContext();
    window.addEventListener('las-solar-context-updated', checkCalculatorContext);
    return () => window.removeEventListener('las-solar-context-updated', checkCalculatorContext);
  }, []);

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleNextStep = async () => {
    if (step === 1) {
      if (!formData.name.trim()) {
        alert('Please enter your full name.');
        return;
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        alert('Please enter a valid email address.');
        return;
      }
      if (!formData.phone.trim()) {
        alert('Please enter your phone number.');
        return;
      }
      if (!formData.address.trim()) {
        alert('Please enter your installation address.');
        return;
      }
    }

    if (step === 2) {
      if (!formData.utilityProvider.trim()) {
        alert('Please enter your utility provider.');
        return;
      }
      if (!formData.monthlyBill) {
        alert('Please select your monthly electric bill range.');
        return;
      }
      if (!formData.roofType) {
        alert('Please select your roof type.');
        return;
      }
      if (!formData.shading) {
        alert('Please select your daytime shading status.');
        return;
      }
    }

    if (step === 3) {
      if (formData.hasDesignatedInverterLocation === 'yes') {
        if (!formData.inverterSetupFile && !formData.inverterSetupUrl) {
          alert('Please upload an inverter location image.');
          return;
        }
        if (!formData.distanceMeters) {
          alert('Please enter the distance between building and panels in meters.');
          return;
        }

        // Upload single file if selected
        if (formData.inverterSetupFile && !formData.inverterSetupUrl) {
          setIsUploadingStep3(true);
          try {
            const url = await uploadImage(formData.inverterSetupFile, 'inverter_setups');
            setFormData(prev => ({
              ...prev,
              inverterSetupUrl: url,
              inverterSetupFile: null
            }));
          } catch (err) {
            console.error('Error uploading image during Step 3 transition:', err);
            alert('Failed to transmit photo. Please check your network connection and try again.');
            return;
          } finally {
            setIsUploadingStep3(false);
          }
        }
      } else {
        // Must upload EXACTLY 2 photos
        if ((!formData.inverterSetupFile1 && !formData.inverterSetupUrl1) || 
            (!formData.inverterSetupFile2 && !formData.inverterSetupUrl2)) {
          alert('You are required to attach exactly 2 photos: one of the Main Panel Board and one of the Proposed Inverter Location.');
          return;
        }
        if (!formData.distanceMeters) {
          alert('Please enter the distance between panel board and inverter.');
          return;
        }

        // Upload both files if selected
        setIsUploadingStep3(true);
        try {
          let url1 = formData.inverterSetupUrl1;
          if (formData.inverterSetupFile1 && !url1) {
            url1 = await uploadImage(formData.inverterSetupFile1, 'inverter_setups');
          }
          let url2 = formData.inverterSetupUrl2;
          if (formData.inverterSetupFile2 && !url2) {
            url2 = await uploadImage(formData.inverterSetupFile2, 'inverter_setups');
          }
          setFormData(prev => ({
            ...prev,
            inverterSetupUrl1: url1,
            inverterSetupUrl2: url2,
            inverterSetupFile1: null,
            inverterSetupFile2: null
          }));
        } catch (err) {
          console.error('Error uploading inverter files during Step 3 transition:', err);
          alert('Failed to transmit photos. Please check your connection and try again.');
          return;
        } finally {
          setIsUploadingStep3(false);
        }
      }
    }

    setStep(prev => Math.min(prev + 1, totalSteps));
  };

  const progress = (step / totalSteps) * 100;

  const getBillBrackets = () => {
    return [
      '₱1,000 – ₱4,000',
      '₱5,000 – ₱8,000',
      '₱9,000 – ₱12,000',
      '₱13,000 – ₱16,000',
      '₱17,000 – ₱25,000',
      '₱26,000 – ₱40,000',
      '₱41,000 – Up'
    ];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.goal) {
      alert('Please select your primary goal.');
      return;
    }
    if (!formData.timeline) {
      alert('Please select your timeline.');
      return;
    }
    if (!formData.ocularVisitDate) {
      alert('Please select a preferred ocular visit date.');
      return;
    }

    if (!isSupabaseConfigured) {
      setIsSubmitting(true);
      // Simulate slow API submission for aesthetic feels
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockLeadId = `local-lead-${Date.now()}`;
      let bill_url = '';
      if (formData.billFile) {
        bill_url = await uploadImage(formData.billFile, 'bills');
      }

      let inverter_url = '';
      if (formData.hasDesignatedInverterLocation === 'yes' && formData.inverterSetupFile) {
        inverter_url = await uploadImage(formData.inverterSetupFile, 'inverter_setups');
      }

      let inverter_url1 = '';
      let inverter_url2 = '';
      if (formData.hasDesignatedInverterLocation === 'no') {
        if (formData.inverterSetupFile1) {
          inverter_url1 = await uploadImage(formData.inverterSetupFile1, 'inverter_setups');
        }
        if (formData.inverterSetupFile2) {
          inverter_url2 = await uploadImage(formData.inverterSetupFile2, 'inverter_setups');
        }
      }

      const formattedAddress = `${formData.address}\n\n[Inverter Location Specs]:\n- Has Designated Location: ${formData.hasDesignatedInverterLocation === 'yes' ? 'Yes' : 'No'}\n${
        formData.hasDesignatedInverterLocation === 'yes'
          ? `- Setup Photo: ${inverter_url || 'None Provided'}\n- Distance to Panel: ${formData.distanceMeters || '—'} meters`
          : `- Setup Photo 1 (Main Panel Board): ${inverter_url1 || '—'}\n- Setup Photo 2 (Proposed Inverter Location): ${inverter_url2 || '—'}\n- Distance: ${formData.distanceMeters || '—'} meters`
      }`;

      const formattedTimeline = `${formData.timeline}${formData.ocularVisitDate ? ` (Preferred Ocular Visit: ${formData.ocularVisitDate} | ${formData.ocularVisitTime})` : ''}`;

      const stored = localStorage.getItem('las_solar_calculator_context');
      let calculatorReportUrl = '';
      let existingLeadId = null;
      
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.dbLeadId) {
            existingLeadId = parsed.dbLeadId;
          }
          if (hasCalcFirstContext) {
            if (parsed.reportUrl) {
              calculatorReportUrl = parsed.reportUrl;
            }
          }
        } catch (err) {
          console.error('Error parsing calculator context in mock submit:', err);
        }
      }

      // Check persistent caches for multiple attempts ONLY if hasCalcFirstContext is true
      if (hasCalcFirstContext) {
        if (!calculatorReportUrl) {
          calculatorReportUrl = localStorage.getItem('las_solar_last_report_url') || '';
        }
        if (!calculatorReportUrl) {
          try {
            const reportsMap = JSON.parse(localStorage.getItem('las_solar_reports_by_contact') || '{}');
            const emailKey = formData.email ? formData.email.trim().toLowerCase() : '';
            const phoneKey = formData.phone ? formData.phone.replace(/\D/g, '') : '';
            if (emailKey && reportsMap[emailKey]) {
              calculatorReportUrl = reportsMap[emailKey];
            } else if (phoneKey && reportsMap[phoneKey]) {
              calculatorReportUrl = reportsMap[phoneKey];
            }
          } catch (err) {
            console.error('Error reading reports map in mock submit:', err);
          }
        }
      }

      // Create separate intake ROI PDF document for direct form submissions if no calculator context exists
      let formReportUrl = '';
      if (!hasCalcFirstContext && formData.monthlyBill) {
        try {
          const doc = generatePDFForForm(formData.name, formData.email, formData.phone, formData.monthlyBill);
          const pdfBlob = doc.output('blob');
          const safeName = formData.name ? formData.name.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'client';
          const pdfFile = new File([pdfBlob], `solar_report_intake_${Date.now()}_${safeName}.pdf`, {
            type: 'application/pdf'
          });
          formReportUrl = await uploadImage(pdfFile, 'bills');
        } catch (pdfErr) {
          console.error('Error generating fallback Intake Form ROI PDF:', pdfErr);
        }
      }

      let combinedUrl = bill_url || '';
      const reportsList = [];
      if (calculatorReportUrl) {
        reportsList.push(calculatorReportUrl);
      }
      if (formReportUrl) {
        reportsList.push(formReportUrl);
      }

      if (reportsList.length > 0) {
        const existingUrls = combinedUrl ? combinedUrl.split(',').map(url => url.trim()).filter(Boolean) : [];
        const checkIsReport = (url: string) => url.toLowerCase().includes('solar_report_') || url.toLowerCase().includes('roi') || url.toLowerCase().includes('calculator');
        const onlyBills = existingUrls.filter(url => !checkIsReport(url));
        const finalUrls = [...onlyBills, ...reportsList];
        combinedUrl = finalUrls.join(',');
      }

      const isReportAttached = !!calculatorReportUrl || !!formReportUrl;
      const finalGoal = isReportAttached 
        ? (formData.goal ? `${formData.goal} (Included Calculator Report)` : 'Detailed Inquiry with ROI Report')
        : (formData.goal || 'Detailed Inquiry');

      const localLead = {
        id: mockLeadId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formattedAddress,
        property_type: formData.propertyType,
        utility_provider: formData.utilityProvider,
        monthly_bill: hasCalcFirstContext
          ? `${formData.monthlyBill} (Solar Calculator Assessed)`
          : `${formData.monthlyBill} (Intake Assessed)`,
        roof_type: formData.roofType,
        shading: formData.shading,
        goal: finalGoal,
        timeline: formattedTimeline,
        bill_url: combinedUrl,
        status: 'New',
        created_at: new Date().toISOString()
      };

      // Append/Merge into fallback local leads
      const existingStr = localStorage.getItem('las_solar_leads_fallback');
      const curFallbackLeads = existingStr ? JSON.parse(existingStr) : [
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

      // Match strictly by ID if this is an explicit continuation of a calculator session
      const matchIndex = existingLeadId 
        ? curFallbackLeads.findIndex((l: any) => l.id === existingLeadId)
        : -1;

      if (matchIndex !== -1) {
        if (curFallbackLeads[matchIndex].bill_url) {
          const dbExistingUrls = curFallbackLeads[matchIndex].bill_url.split(',').map((url: string) => url.trim()).filter(Boolean);
          const incomingUrls = combinedUrl.split(',').map(url => url.trim()).filter(Boolean);
          const allMergedUrls = Array.from(new Set([...dbExistingUrls, ...incomingUrls]));
          localLead.bill_url = allMergedUrls.join(',');
        }
        curFallbackLeads[matchIndex] = { ...curFallbackLeads[matchIndex], ...localLead, id: curFallbackLeads[matchIndex].id };
      } else {
        curFallbackLeads.unshift(localLead);
      }

      localStorage.setItem('las_solar_leads_fallback', JSON.stringify(curFallbackLeads));

      localStorage.removeItem('las_solar_calculator_context');
      localStorage.removeItem('las_solar_form_lead_context');
      sessionStorage.removeItem('las_solar_trigger_prefill_form');

      if (!hasCalcFirstContext) {
        const savedContext = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          formattedAddress: formattedAddress,
          propertyType: formData.propertyType,
          monthlyBill: formData.monthlyBill,
          billUrl: combinedUrl,
          dbLeadId: mockLeadId,
          completedForm: true
        };
        localStorage.setItem('las_solar_form_lead_context', JSON.stringify(savedContext));
      }

      window.dispatchEvent(new Event('las-solar-context-updated'));
      setIsSubmitting(false);
      setIsSuccess(true);
      return;
    }

    setIsSubmitting(true);
    try {
      let bill_url = '';
      if (formData.billFile) {
        bill_url = await uploadImage(formData.billFile, 'bills');
      }

      // Secure cached step 3 url or upload remaining file
      let inverter_url = formData.inverterSetupUrl;
      if (formData.hasDesignatedInverterLocation === 'yes' && formData.inverterSetupFile && !inverter_url) {
        inverter_url = await uploadImage(formData.inverterSetupFile, 'inverter_setups');
      }

      let inverter_url1 = formData.inverterSetupUrl1;
      let inverter_url2 = formData.inverterSetupUrl2;
      if (formData.hasDesignatedInverterLocation === 'no') {
        if (formData.inverterSetupFile1 && !inverter_url1) {
          inverter_url1 = await uploadImage(formData.inverterSetupFile1, 'inverter_setups');
        }
        if (formData.inverterSetupFile2 && !inverter_url2) {
          inverter_url2 = await uploadImage(formData.inverterSetupFile2, 'inverter_setups');
        }
      }

      const formattedAddress = `${formData.address}\n\n[Inverter Location Specs]:\n- Has Designated Location: ${formData.hasDesignatedInverterLocation === 'yes' ? 'Yes' : 'No'}\n${
        formData.hasDesignatedInverterLocation === 'yes'
          ? `- Setup Photo: ${inverter_url || 'None Provided'}\n- Distance to Panel: ${formData.distanceMeters || '—'} meters`
          : `- Setup Photo 1 (Main Panel Board): ${inverter_url1 || '—'}\n- Setup Photo 2 (Proposed Inverter Location): ${inverter_url2 || '—'}\n- Distance: ${formData.distanceMeters || '—'} meters`
      }`;

      const formattedTimeline = `${formData.timeline}${formData.ocularVisitDate ? ` (Preferred Ocular Visit: ${formData.ocularVisitDate} | ${formData.ocularVisitTime})` : ''}`;

      let ocularVisitDateTime = '';
      if (formData.ocularVisitDate) {
        const timeSuffix = formData.ocularVisitTime === '9:00 AM - 12:00 PM' ? '09:00:00' : '13:00:00';
        ocularVisitDateTime = `${formData.ocularVisitDate}T${timeSuffix}`;
      }

      const stored = localStorage.getItem('las_solar_calculator_context');
      let calculatorReportUrl = '';
      let existingLeadId = null;
      
      // Parse dbLeadId if stored inside calculator session context regardless
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.dbLeadId) {
            existingLeadId = parsed.dbLeadId;
          }
          if (hasCalcFirstContext) {
            if (parsed.reportUrl) {
              calculatorReportUrl = parsed.reportUrl;
            }
          }
        } catch (err) {
          console.error('Error parsing calculator context in submit:', err);
        }
      }

      // Check persistent caches for multiple attempts ONLY if hasCalcFirstContext is true
      if (hasCalcFirstContext) {
        if (!calculatorReportUrl) {
          calculatorReportUrl = localStorage.getItem('las_solar_last_report_url') || '';
        }
        if (!calculatorReportUrl) {
          try {
            const reportsMap = JSON.parse(localStorage.getItem('las_solar_reports_by_contact') || '{}');
            const emailKey = formData.email ? formData.email.trim().toLowerCase() : '';
            const phoneKey = formData.phone ? formData.phone.replace(/\D/g, '') : '';
            if (emailKey && reportsMap[emailKey]) {
              calculatorReportUrl = reportsMap[emailKey];
            } else if (phoneKey && reportsMap[phoneKey]) {
              calculatorReportUrl = reportsMap[phoneKey];
            }
          } catch (err) {
            console.error('Error reading reports map in submit:', err);
          }
        }
      }

      // Create separate intake ROI PDF document for direct form submissions if no calculator context exists
      let formReportUrl = '';
      if (!hasCalcFirstContext && formData.monthlyBill) {
        try {
          const doc = generatePDFForForm(formData.name, formData.email, formData.phone, formData.monthlyBill);
          const pdfBlob = doc.output('blob');
          const safeName = formData.name ? formData.name.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'client';
          const pdfFile = new File([pdfBlob], `solar_report_intake_${Date.now()}_${safeName}.pdf`, {
            type: 'application/pdf'
          });
          formReportUrl = await uploadImage(pdfFile, 'bills');
        } catch (pdfErr) {
          console.error('Error generating database Intake Form ROI PDF:', pdfErr);
        }
      }

      let combinedUrl = bill_url || '';
      const reportsList = [];
      if (calculatorReportUrl) {
        reportsList.push(calculatorReportUrl);
      }
      if (formReportUrl) {
        reportsList.push(formReportUrl);
      }

      if (reportsList.length > 0) {
        const existingUrls = combinedUrl ? combinedUrl.split(',').map(url => url.trim()).filter(Boolean) : [];
        const checkIsReport = (url: string) => url.toLowerCase().includes('solar_report_') || url.toLowerCase().includes('roi') || url.toLowerCase().includes('calculator');
        const onlyBills = existingUrls.filter(url => !checkIsReport(url));
        const finalUrls = [...onlyBills, ...reportsList];
        combinedUrl = finalUrls.join(',');
      }

      // Fetch existing lead by ID to merge bill_url and updates cleanly instead of creating duplicate records for the session
      let resolvedLeadId = existingLeadId;
      if (resolvedLeadId) {
        // If existingLeadId is set, fetch and merge its bill_url
        try {
          const { data } = await supabase
            .from('leads')
            .select('bill_url')
            .eq('id', resolvedLeadId)
            .limit(1);
          if (data && data[0] && data[0].bill_url) {
            const dbExistingUrls = data[0].bill_url.split(',').map((url: string) => url.trim()).filter(Boolean);
            const incomingUrls = combinedUrl.split(',').map(url => url.trim()).filter(Boolean);
            const allMergedUrls = Array.from(new Set([...dbExistingUrls, ...incomingUrls]));
            combinedUrl = allMergedUrls.join(',');
          }
        } catch (dbErr) {
          console.error('Error fetching database bill_url for explicitly linked existingLeadId:', dbErr);
        }
      }

      const isReportAttached = !!calculatorReportUrl || !!formReportUrl;
      const finalGoal = isReportAttached 
        ? (formData.goal ? `${formData.goal} (Included Calculator Report)` : 'Detailed Inquiry with ROI Report')
        : (formData.goal || 'Detailed Inquiry');

      const leadPayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formattedAddress,
        property_type: formData.propertyType,
        utility_provider: formData.utilityProvider,
        monthly_bill: hasCalcFirstContext
          ? `${formData.monthlyBill} (Solar Calculator Assessed)`
          : `${formData.monthlyBill} (Intake Assessed)`,
        roof_type: formData.roofType,
        shading: formData.shading,
        goal: finalGoal,
        timeline: formattedTimeline,
        bill_url: combinedUrl,
        status: 'New'
      };

      const queryResult = resolvedLeadId
        ? await supabase
            .from('leads')
            .update(leadPayload)
            .eq('id', resolvedLeadId)
            .select()
        : await supabase
            .from('leads')
            .insert(leadPayload)
            .select();

      const { data, error } = queryResult;
      if (error) throw error;

      let dbLeadIdResolved = data && data[0]?.id ? data[0].id : resolvedLeadId;

      // Always clear the contexts right now so that any future submissions will start fresh instead of overwriting or pre-filling outdated data.
      localStorage.removeItem('las_solar_calculator_context');
      localStorage.removeItem('las_solar_form_lead_context');
      sessionStorage.removeItem('las_solar_trigger_prefill_form');

      // If they completed the Form first, we save the form context to let the calculator prefill when they land on it as Step 2.
      if (!hasCalcFirstContext) {
        const savedContext = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          formattedAddress: formattedAddress,
          propertyType: formData.propertyType,
          monthlyBill: formData.monthlyBill,
          billUrl: combinedUrl,
          dbLeadId: dbLeadIdResolved,
          completedForm: true
        };
        localStorage.setItem('las_solar_form_lead_context', JSON.stringify(savedContext));
      }

      window.dispatchEvent(new Event('las-solar-context-updated'));
      setIsSuccess(true);
    } catch (err) {
      console.error('Error submitting lead:', err);
      alert('Failed to send message. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    // Prevent accidental submissions when pressing Enter inside text or date inputs
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
      e.preventDefault();
    }
  };

  if (isSuccess) {
    return (
      <div className={`bg-[#0A0A0A] p-8 md:p-12 rounded-xl border border-white/10 relative overflow-hidden flex flex-col items-center justify-center text-center min-h-[720px] ${className}`}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-6 w-full"
        >
          <div className="w-20 h-20 bg-app-purple rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(138,43,226,0.2)]">
            <CheckCircle2 size={40} className="text-white" />
          </div>
          <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Requirement <span className="text-app-purple">Received</span></h3>
          <p className="text-slate-400 font-light max-w-sm mx-auto text-sm leading-relaxed">
            Our engineering team is already reviewing your property's satellite profile. Expect a preliminary design via email or phone within 24-48 hours.
          </p>

          <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-3xl text-left max-w-sm mx-auto shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-white fill-white" />
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Analyze Your ROI Instantly</h4>
            </div>
            <p className="text-slate-400 text-[11px] mb-4 leading-relaxed">
              Don't wait for a manual design! We've pre-loaded our interactive Smart-Sense calculator with your details and bill range. Click below to view your potential system payoff period and monthly savings instantly.
            </p>
            <button
              onClick={() => {
                const element = document.getElementById('calculator');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/request-quote#calculator');
                }
              }}
              className="w-full text-center bg-app-purple hover:bg-white hover:text-black text-white font-black uppercase text-[10px] py-3.5 rounded-xl tracking-widest transition-all shadow-md active:scale-95"
            >
              Start Interactive ROI Calculator →
            </button>
          </div>

          <button 
            onClick={() => { 
              setIsSuccess(false); 
              setStep(1); 
              setFormData({
                propertyType: 'Residential (House & Lot)',
                name: '',
                email: '',
                phone: '',
                address: '',
                utilityProvider: '',
                monthlyBill: '',
                roofType: '',
                shading: '',
                goal: '',
                timeline: '',
                billFile: null as File | null,
                inverterSetupFile: null as File | null,
                inverterSetupUrl: '',
                inverterSetupFilename: '',
                inverterSetupFile1: null as File | null,
                inverterSetupFile2: null as File | null,
                inverterSetupUrl1: '',
                inverterSetupUrl2: '',
                inverterSetupFilename1: '',
                inverterSetupFilename2: '',
                billFilename: '',
                ocularVisitDate: '',
                ocularVisitTime: '9:00 AM - 12:00 PM',
                hasDesignatedInverterLocation: 'yes',
                inverterLocationDetails: '',
                panelBoardLocation: '',
                proposedInverterLocation: '',
                distanceMeters: ''
              });
              localStorage.removeItem('las_solar_form_lead_context');
              localStorage.removeItem('las_solar_calculator_context');
              sessionStorage.removeItem('las_solar_trigger_prefill_form');
              window.dispatchEvent(new Event('las-solar-context-updated'));
            }}
            className="text-white/40 font-black uppercase tracking-[0.2em] text-[10px] hover:text-white transition-colors block mx-auto pt-4"
          >
            Send Another Inquiry
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div id="request-quote-form" className={`bg-[#0A0A0A] p-8 md:p-12 rounded-xl border border-white/10 relative overflow-hidden flex flex-col min-h-[720px] ${className}`}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-app-purple/5 rounded-full blur-[100px]"></div>

      <div className="relative z-10 mb-8">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">
            Send Us A <span className="text-app-purple">Message</span>
          </h3>
          <span className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1">Step {step} of {totalSteps}</span>
        </div>
        
        {/* Progress Bar - Minimalist */}
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-6">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-app-purple"
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Step Title */}
        <motion.div
           key={`title-${step}`}
           initial={{ opacity: 0, y: 5 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex items-center gap-3"
        >
          <div className="h-px flex-grow bg-white/5"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
            {step === 1 && "Identity & Location"}
            {step === 2 && "Energy & Roof Specs"}
            {step === 3 && "Inverter & Panel Setup"}
            {step === 4 && "Optimization Goals"}
          </span>
          <div className="h-px flex-grow bg-white/5"></div>
        </motion.div>
      </div>

      <form className="relative z-10 flex-grow flex flex-col" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        <div className="flex-grow">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Property Type</label>
                    <select 
                      value={formData.propertyType}
                      onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                      className="w-full px-5 py-3.5 bg-[#151515] border border-white/5 rounded-lg text-white text-sm focus:border-app-purple focus:outline-none appearance-none cursor-pointer font-medium"
                    >
                      <option value="Residential (House & Lot)" className="bg-[#0A0A0A]">Residential (House & Lot)</option>
                      <option value="Commercial / Office" className="bg-[#0A0A0A]">Commercial / Office</option>
                      <option value="Industrial / Warehouse" className="bg-[#0A0A0A]">Industrial / Warehouse</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-5 py-3.5 bg-[#151515] border border-white/5 rounded-lg text-white text-sm focus:border-app-purple focus:outline-none placeholder:text-white/10 font-medium" 
                      placeholder="Juan De La Cruz" 
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email</label>
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-5 py-3.5 bg-[#151515] border border-white/5 rounded-lg text-white text-sm focus:border-app-purple focus:outline-none placeholder:text-white/10 font-medium" 
                        placeholder="juan@example.com" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Phone Number</label>
                      <input 
                        type="tel" 
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-5 py-3.5 bg-[#151515] border border-white/5 rounded-lg text-white text-sm focus:border-app-purple focus:outline-none placeholder:text-white/10 font-medium" 
                        placeholder="0917 XXX XXXX" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Installation Address</label>
                    <textarea 
                      rows={2}
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-5 py-3.5 bg-[#151515] border border-white/5 rounded-lg text-white text-sm focus:border-app-purple focus:outline-none resize-none placeholder:text-white/10 font-medium" 
                      placeholder="Complete address for satellite analysis..." 
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Utility Provider</label>
                    <input 
                      type="text" 
                      required
                      value={formData.utilityProvider}
                      onChange={(e) => setFormData({ ...formData, utilityProvider: e.target.value })}
                      className="w-full px-5 py-3.5 bg-[#151515] border border-white/5 rounded-lg text-white text-sm focus:border-app-purple focus:outline-none placeholder:text-white/10 font-medium" 
                      placeholder="e.g., Meralco" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Monthly Electric Bill</label>
                    <select 
                      required
                      value={formData.monthlyBill}
                      onChange={(e) => setFormData({ ...formData, monthlyBill: e.target.value })}
                      className="w-full px-5 py-3.5 bg-[#151515] border border-white/5 rounded-lg text-white text-sm focus:border-app-purple focus:outline-none appearance-none"
                    >
                      <option value="" className="bg-[#0A0A0A]">Select Range</option>
                      {getBillBrackets().map((bracket) => (
                        <option key={bracket} value={bracket} className="bg-[#0A0A0A]">{bracket}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Roof Type</label>
                    <select 
                      required
                      value={formData.roofType}
                      onChange={(e) => setFormData({ ...formData, roofType: e.target.value })}
                      className="w-full px-5 py-3.5 bg-[#151515] border border-white/5 rounded-lg text-white text-sm focus:border-app-purple focus:outline-none appearance-none"
                    >
                      <option value="" className="bg-[#0A0A0A]">Select Type</option>
                      <option value="Rib-type / Corrugated GI Sheet" className="bg-[#0A0A0A]">Rib-type / Corrugated GI Sheet</option>
                      <option value="Concrete Slab (Flat Roof)" className="bg-[#0A0A0A]">Concrete Slab (Flat Roof)</option>
                      <option value="Tile Roof (Tisa)" className="bg-[#0A0A0A]">Tile Roof (Tisa)</option>
                      <option value="Others / Not Sure" className="bg-[#0A0A0A]">Others / Not Sure</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Daytime Shading?</label>
                    <select 
                      required
                      value={formData.shading}
                      onChange={(e) => setFormData({ ...formData, shading: e.target.value })}
                      className="w-full px-5 py-3.5 bg-[#151515] border border-white/5 rounded-lg text-white text-sm focus:border-app-purple focus:outline-none appearance-none"
                    >
                      <option value="" className="bg-[#0A0A0A]">Select Option</option>
                      <option value="No, clear sunlight all day" className="bg-[#0A0A0A]">No, clear sunlight all day</option>
                      <option value="Yes, from nearby trees/buildings" className="bg-[#0A0A0A]">Yes, from nearby trees/buildings</option>
                      <option value="Not sure" className="bg-[#0A0A0A]">Not sure</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-app-purple ml-1">Designated Inverter Location</label>
                    <select 
                      required
                      value={formData.hasDesignatedInverterLocation}
                      onChange={(e) => setFormData({ ...formData, hasDesignatedInverterLocation: e.target.value })}
                      className="w-full px-5 py-3.5 bg-[#151515] border border-white/5 rounded-lg text-white text-sm focus:border-app-purple focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="yes" className="bg-[#0A0A0A]">Yes, I have an inverter location selected</option>
                      <option value="no" className="bg-[#0A0A0A]">No designated location yet (site survey needed)</option>
                    </select>
                  </div>

                  <AnimatePresence mode="wait">
                    {formData.hasDesignatedInverterLocation === 'yes' ? (
                      <motion.div
                        key="has-location"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 pt-1 overflow-hidden animate-fade-in"
                      >
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Attach Inverter Location Image</label>
                          <div className="relative group cursor-pointer block">
                            <div className="w-full px-6 py-8 bg-[#1a1a1a] border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center group-hover:border-app-purple/50 transition-colors">
                              <Upload className="text-slate-600 mb-2 group-hover:text-app-purple transition-colors" size={24} />
                              <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-black">Upload Photo</p>
                            </div>
                            <input 
                              type="file" 
                              accept="image/*"
                              required
                              className="absolute inset-0 opacity-0 cursor-pointer" 
                              onChange={(e) => {
                                const file = e.target.files ? e.target.files[0] : null;
                                setFormData({ 
                                  ...formData, 
                                  inverterSetupFile: file,
                                  inverterSetupFilename: file ? file.name : '',
                                  inverterSetupUrl: ''
                                });
                              }}
                            />
                          </div>
                          {isUploadingStep3 && (
                            <p className="text-[10px] text-amber-500 mt-2 font-bold uppercase tracking-widest truncate text-center flex items-center justify-center gap-1.5 animate-pulse">
                              Transmitting image... <Loader2 className="animate-spin text-amber-500" size={12} />
                            </p>
                          )}
                          {!isUploadingStep3 && formData.inverterSetupUrl && (
                            <p className="text-[10px] text-green-500 mt-2 font-bold uppercase tracking-widest truncate text-center">
                              ✓ Transmitted: {formData.inverterSetupFilename}
                            </p>
                          )}
                          {!isUploadingStep3 && !formData.inverterSetupUrl && formData.inverterSetupFile && (
                            <p className="text-[10px] text-app-purple mt-2 font-bold uppercase tracking-widest truncate text-center">
                              ✓ Ready & verified: {formData.inverterSetupFilename}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Distance between building & panels (in Meters)</label>
                          <input 
                            type="number" 
                            required
                            min="0"
                            value={formData.distanceMeters}
                            onChange={(e) => setFormData({ ...formData, distanceMeters: e.target.value })}
                            className="w-full px-5 py-3.5 bg-[#151515] border border-white/5 rounded-lg text-white text-sm focus:border-app-purple focus:outline-none placeholder:text-white/10 font-medium" 
                            placeholder="Distance in meters" 
                          />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="no-location"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 pt-1 overflow-hidden animate-fade-in"
                      >
                        <p className="text-slate-400 font-medium text-[11px] leading-relaxed mb-1">
                          Since no safe inverter location is pre-designated, our engineering team requires <strong className="text-white">exactly 2 photos</strong> to verify your layout.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Photo 1: Main Panel Board */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#8A2BE2] ml-1">Photo 1: Main Panel Board</label>
                            <div className="relative group cursor-pointer block">
                              <div className="w-full px-4 py-6 bg-[#1a1a1a] border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center group-hover:border-app-purple/50 transition-colors">
                                <Upload className="text-slate-600 mb-1 group-hover:text-app-purple transition-colors" size={18} />
                                <p className="text-[9px] text-slate-400 text-center uppercase tracking-widest font-black">Upload Panel Photo</p>
                              </div>
                              <input 
                                type="file" 
                                accept="image/*"
                                required
                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                onChange={(e) => {
                                  const file = e.target.files ? e.target.files[0] : null;
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    inverterSetupFile1: file,
                                    inverterSetupFilename1: file ? file.name : '',
                                    inverterSetupUrl1: ''
                                  }));
                                }}
                              />
                            </div>
                            {formData.inverterSetupUrl1 && (
                              <p className="text-[9px] text-green-500 mt-1 font-bold uppercase tracking-widest truncate text-center">✓ Transmitted: {formData.inverterSetupFilename1}</p>
                            )}
                            {!formData.inverterSetupUrl1 && formData.inverterSetupFile1 && (
                              <p className="text-[9px] text-app-purple mt-1 font-bold uppercase tracking-widest truncate text-center">✓ Ready: {formData.inverterSetupFilename1}</p>
                            )}
                          </div>

                          {/* Photo 2: Proposed Inverter Location */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#8A2BE2] ml-1">Photo 2: Proposed Location</label>
                            <div className="relative group cursor-pointer block">
                              <div className="w-full px-4 py-6 bg-[#1a1a1a] border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center group-hover:border-app-purple/50 transition-colors">
                                <Upload className="text-slate-600 mb-1 group-hover:text-app-purple transition-colors" size={18} />
                                <p className="text-[9px] text-slate-400 text-center uppercase tracking-widest font-black">Upload Location Photo</p>
                              </div>
                              <input 
                                type="file" 
                                accept="image/*"
                                required
                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                onChange={(e) => {
                                  const file = e.target.files ? e.target.files[0] : null;
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    inverterSetupFile2: file,
                                    inverterSetupFilename2: file ? file.name : '',
                                    inverterSetupUrl2: ''
                                  }));
                                }}
                              />
                            </div>
                            {formData.inverterSetupUrl2 && (
                              <p className="text-[9px] text-green-500 mt-1 font-bold uppercase tracking-widest truncate text-center">✓ Transmitted: {formData.inverterSetupFilename2}</p>
                            )}
                            {!formData.inverterSetupUrl2 && formData.inverterSetupFile2 && (
                              <p className="text-[9px] text-app-purple mt-1 font-bold uppercase tracking-widest truncate text-center">✓ Ready: {formData.inverterSetupFilename2}</p>
                            )}
                          </div>
                        </div>

                        {isUploadingStep3 && (
                          <p className="text-[10px] text-amber-500 mt-2 font-bold uppercase tracking-widest truncate text-center flex items-center justify-center gap-1.5 animate-pulse">
                            Transmitting images... <Loader2 className="animate-spin text-amber-500" size={12} />
                          </p>
                        )}

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Distance between panel board & inverter (in Meters)</label>
                          <input 
                            type="number" 
                            required
                            min="0"
                            value={formData.distanceMeters}
                            onChange={(e) => setFormData({ ...formData, distanceMeters: e.target.value })}
                            className="w-full px-5 py-3.5 bg-[#151515] border border-white/5 rounded-lg text-white text-sm focus:border-app-purple focus:outline-none placeholder:text-white/10 font-medium" 
                            placeholder="Distance in meters" 
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Primary Goal</label>
                    <select 
                      required
                      value={formData.goal}
                      onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                      className="w-full px-5 py-3.5 bg-[#151515] border border-white/5 rounded-lg text-white text-sm focus:border-app-purple focus:outline-none appearance-none"
                    >
                      <option value="" className="bg-[#0A0A0A]">Select Goal</option>
                      <option value="Lowering daytime electric bill" className="bg-[#0A0A0A]">Lowering daytime electric bill (Grid-Tied)</option>
                      <option value="Backup power durante brownouts" className="bg-[#0A0A0A]">Backup power (Hybrid / Battery)</option>
                      <option value="Going completely off-grid" className="bg-[#0A0A0A]">Going completely off-grid</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Timeline</label>
                    <select 
                      required
                      value={formData.timeline}
                      onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                      className="w-full px-5 py-3.5 bg-[#151515] border border-white/5 rounded-lg text-white text-sm focus:border-app-purple focus:outline-none appearance-none"
                    >
                      <option value="" className="bg-[#0A0A0A]">Select Timeline</option>
                      <option value="Immediately" className="bg-[#0A0A0A]">Immediately (2-3 weeks)</option>
                      <option value="1 to 3 months" className="bg-[#0A0A0A]">In 1 to 3 months</option>
                      <option value="Researching" className="bg-[#0A0A0A]">Just researching</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Preferred Ocular Visit Date</label>
                    <input 
                      type="date" 
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.ocularVisitDate}
                      onChange={(e) => setFormData({ ...formData, ocularVisitDate: e.target.value })}
                      className="w-full px-5 py-3.5 bg-[#151515] border border-white/5 rounded-lg text-white text-sm focus:border-app-purple focus:outline-none font-medium cursor-pointer [color-scheme:dark]" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Preferred Visit Time Slot</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, ocularVisitTime: '9:00 AM - 12:00 PM' })}
                        className={`py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all text-center ${
                          formData.ocularVisitTime === '9:00 AM - 12:00 PM'
                            ? 'bg-app-purple text-white border-app-purple shadow-[0_0_15px_rgba(138,43,226,0.3)]'
                            : 'bg-[#151515] text-slate-400 border-white/5 hover:border-white/10'
                        }`}
                      >
                        9:00 AM - 12:00 PM
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, ocularVisitTime: '1:00 PM - 4:00 PM' })}
                        className={`py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all text-center ${
                          formData.ocularVisitTime === '1:00 PM - 4:00 PM'
                            ? 'bg-app-purple text-white border-app-purple shadow-[0_0_15px_rgba(138,43,226,0.3)]'
                            : 'bg-[#151515] text-slate-400 border-white/5 hover:border-white/10'
                        }`}
                      >
                        1:00 PM - 4:00 PM
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-500 ml-1 font-bold uppercase tracking-widest leading-relaxed">
                      Select a preferred target date and time frame slot for our technical engineers to survey your facility & solar board.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-app-purple ml-1">Upload Latest Bill (Optional)</label>
                    <div className="relative group cursor-pointer block">
                      <div className="w-full px-6 py-8 bg-[#1a1a1a] border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center group-hover:border-app-purple/50 transition-colors">
                        <Upload className="text-slate-600 mb-2 group-hover:text-app-purple transition-colors" size={24} />
                        <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-black">Browse Image File Only</p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={(e) => {
                          const file = e.target.files ? e.target.files[0] : null;
                          if (file && !file.type.startsWith('image/')) {
                            setBillUploadError('Please select an image file (PNG, JPG, JPEG). PDF files are no longer accepted.');
                            setFormData(prev => ({ 
                              ...prev, 
                              billFile: null,
                              billFilename: ''
                            }));
                          } else {
                            setBillUploadError('');
                            setFormData(prev => ({ 
                              ...prev, 
                              billFile: file,
                              billFilename: file ? file.name : ''
                            }));
                          }
                        }}
                      />
                    </div>
                    {billUploadError && (
                      <p className="text-[10px] text-rose-500 mt-2 font-bold uppercase tracking-widest leading-relaxed">
                        ⚠ {billUploadError}
                      </p>
                    )}
                    {formData.billFile && (
                      <p className="text-[10px] text-app-purple mt-2 font-bold uppercase tracking-widest truncate">
                        ✓ {formData.billFilename}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-4 pt-8 mt-auto">
          {step > 1 && (
            <button 
              type="button" 
              onClick={prevStep}
              className="px-6 py-4 rounded-lg border border-white/5 text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
              disabled={isSubmitting || isUploadingStep3}
            >
              <ChevronLeft size={14} />
            </button>
          )}
          {step < totalSteps ? (
            <button 
              type="button" 
              onClick={handleNextStep}
              disabled={isUploadingStep3}
              className="flex-1 bg-app-purple py-4 rounded-lg text-white text-[10px] font-black tracking-[0.2em] uppercase flex items-center justify-center gap-2 hover:bg-app-purple/90 transition-colors disabled:opacity-50"
            >
              {isUploadingStep3 ? (
                <>Transmitting image... <Loader2 className="animate-spin text-white" size={14} /></>
              ) : (
                <>Next Step <ChevronRight size={14} /></>
              )}
            </button>
          ) : (
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-app-purple py-4 rounded-lg text-white text-[10px] font-black tracking-[0.2em] uppercase flex items-center justify-center gap-2 hover:bg-app-purple/90 transition-colors"
            >
              {isSubmitting ? (
                <>Transmitting Quote... <Loader2 className="animate-spin" size={14} /></>
              ) : (
                <>Submit Quote <Send size={14} /></>
              )}
            </button>
          )}
        </div>

        {/* Payback Period Statement */}
        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">
            Estimated Payback Period: <span className="text-app-purple">3-5 Years</span>
          </p>
        </div>
      </form>
    </div>
  );
}
