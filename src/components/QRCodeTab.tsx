import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  Download, Printer, Sparkles, RefreshCw, Layers, Check, 
  Settings, Type, Palette, ChevronRight, Hash, Eye, Award
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TempTemplate {
  id: string;
  name: string;
  headerText: string;
  subText: string;
  primaryColor: string;
  bgColor: string;
  gradientFrom: string;
  gradientTo: string;
  textColor: string;
  badgeBg: string;
  badgeText: string;
  logo: string;
}

const FRAME_TEMPLATES: TempTemplate[] = [
  {
    id: 'gpay',
    name: 'UPI / GPay Pay-Style',
    headerText: 'SCAN TO ORDER & DINE',
    subText: '1. Scan QR  •  2. Order Food  •  3. Delivered to Table',
    primaryColor: '#002F6C',
    bgColor: '#FDFBF7',
    gradientFrom: '#0A74DA',
    gradientTo: '#003366',
    textColor: '#FFFFFF',
    badgeBg: '#FFF9E6',
    badgeText: '#D97706',
    logo: '🍽️'
  },
  {
    id: 'sunset',
    name: 'Sunset Bistro Orange',
    headerText: 'FASTEST contactless ordering',
    subText: 'Skip the Counter! Tap directly into our kitchen.',
    primaryColor: '#FF6B00',
    bgColor: '#FFFBF5',
    gradientFrom: '#FF6B00',
    gradientTo: '#B33C00',
    textColor: '#FFFFFF',
    badgeBg: '#FFF1E6',
    badgeText: '#FF6B00',
    logo: '🍔'
  },
  {
    id: 'luxury',
    name: 'Matte Charcoal & Gold',
    headerText: 'URBAN LUXURY DINING',
    subText: 'Please scan to discover our culinary masterpieces.',
    primaryColor: '#1A1A1A',
    bgColor: '#1A1A1A',
    gradientFrom: '#1c1917',
    gradientTo: '#0a0908',
    textColor: '#D4AF37',
    badgeBg: '#2D2926',
    badgeText: '#FFD700',
    logo: '✨'
  },
  {
    id: 'eco',
    name: 'Eco Healthy Green',
    headerText: 'FRESH MEALS AT YOUR TABLE',
    subText: 'Farm-to-fork selection of organic bowls and drinks',
    primaryColor: '#0F5132',
    bgColor: '#F4F9F4',
    gradientFrom: '#157347',
    gradientTo: '#0E4429',
    textColor: '#FFFFFF',
    badgeBg: '#E8F5E9',
    badgeText: '#1B5E20',
    logo: '🥗'
  }
];

const LOGO_OPTIONS = [
  { id: 'plate', label: '🍽️ Tableware', emoji: '🍽️' },
  { id: 'burger', label: '🍔 Burger', emoji: '🍔' },
  { id: 'pizza', label: '🍕 Pizza', emoji: '🍕' },
  { id: 'coffee', label: '☕ Cafe Mug', emoji: '☕' },
  { id: 'sparkle', label: '✨ Sparkle', emoji: '✨' },
  { id: 'chili', label: '🌶️ Hot Pepper', emoji: '🌶️' },
  { id: 'rice', label: '🍛 Curry', emoji: '🍛' },
  { id: 'none', label: '❌ No Central Icon', emoji: '' }
];

export default function QRCodeTab() {
  const [tableInput, setTableInput] = useState<string>('3');
  const [selectedTemplate, setSelectedTemplate] = useState<TempTemplate>(FRAME_TEMPLATES[1]); // Bistro default
  const [centerLogo, setCenterLogo] = useState<string>('🍔');
  const [customHeader, setCustomHeader] = useState<string>('');
  const [customSub, setCustomSub] = useState<string>('');
  
  // Advanced Controls
  const [qrBlobUrl, setQrBlobUrl] = useState<string>('');
  const [dotColor, setDotColor] = useState<string>('#1D1D1F');
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('H'); // High allowed for logo embeds
  const [batchMode, setBatchMode] = useState<boolean>(false);
  const [batchStart, setBatchStart] = useState<number>(1);
  const [batchEnd, setBatchEnd] = useState<number>(10);

  // Hidden print reference
  const printIframeRef = useRef<HTMLIFrameElement | null>(null);

  // Computed Values
  const getDineInUrl = (tabNode: string) => {
    const base = window.location.origin;
    return `${base}?table=${encodeURIComponent(tabNode)}`;
  };

  // Regeneration of single QR Code
  useEffect(() => {
    generateMainQr();
  }, [tableInput, errorCorrection, dotColor, centerLogo]);

  const generateMainQr = async () => {
    try {
      const urlText = getDineInUrl(tableInput || '3');
      const dataUrl = await QRCode.toDataURL(urlText, {
        errorCorrectionLevel: errorCorrection,
        margin: 1,
        width: 400,
        color: {
          dark: dotColor,
          light: '#FFFFFF'
        }
      });
      setQrBlobUrl(dataUrl);
    } catch (err) {
      console.error(err);
      toast.error('Could not generate QR code matrix.');
    }
  };

  const currentHeader = customHeader || selectedTemplate.headerText;
  const currentSub = customSub || selectedTemplate.subText;

  // Single Standee Export to Canvas & Download
  const triggerDownloadPNG = (tabNode: string) => {
    toast.loading('Compiling High-Res assets...', { id: 'export-prog' });

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 850;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      toast.error('Web Canvas initialization failures');
      return;
    }

    // Step 1: Draw high quality card background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, selectedTemplate.gradientFrom);
    gradient.addColorStop(0.3, selectedTemplate.gradientTo);
    gradient.addColorStop(1, selectedTemplate.gradientTo);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle background visual dots/glow
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < canvas.width; i += 40) {
      for (let j = 0; j < canvas.height; j += 40) {
        ctx.beginPath();
        ctx.arc(i + (j % 3 === 0 ? 10 : 0), j, 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1.0;

    // Outer frame Border lines (Luxury gold/white)
    ctx.strokeStyle = selectedTemplate.textColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

    // Inner White Container for QR and directions
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 8;
    ctx.beginPath();
    ctx.roundRect(40, 160, canvas.width - 80, 520, 30);
    ctx.fill();
    ctx.shadowBlur = 0; // Reset
    ctx.shadowOffsetY = 0;

    // Header Banner text inside canvas
    ctx.fillStyle = selectedTemplate.textColor;
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(currentHeader.toUpperCase(), canvas.width / 2, 80);

    // Micro Food Icons under title
    ctx.font = '18px Arial';
    ctx.fillText('⚡ NO APP DOWNLOAD REQUIRED ⚡', canvas.width / 2, 115);

    // Dynamic QR generation inside canvas helper
    const qrImage = new Image();
    const targetUrl = getDineInUrl(tabNode);

    QRCode.toDataURL(targetUrl, {
      errorCorrectionLevel: 'H', // Use High for center logo overlay
      margin: 1,
      width: 320,
      color: {
        dark: dotColor,
        light: '#FFFFFF'
      }
    }).then(base64Source => {
      qrImage.onload = () => {
        // Center of the inner card
        const qrSize = 300;
        const qrX = (canvas.width - qrSize) / 2;
        const qrY = 190;
        
        ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

        // Draw central logo embed
        if (centerLogo) {
          const logoSize = 65;
          const logoX = qrX + (qrSize - logoSize) / 2;
          const logoY = qrY + (qrSize - logoSize) / 2;

          // Draw Rounded Base Plate for center emoji
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = 'rgba(0,0,0,0.15)';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.roundRect(logoX - 4, logoY - 4, logoSize + 8, logoSize + 8, 14);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Draw Fine Stroke on Plate
          ctx.strokeStyle = '#EBE6E0';
          ctx.lineWidth = 1.5;
          ctx.roundRect(logoX - 4, logoY - 4, logoSize + 8, logoSize + 8, 14);
          ctx.stroke();

          // Emoji Render
          ctx.font = '40px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(centerLogo, logoX + (logoSize / 2), logoY + (logoSize / 2) + 2);
        }

        // Table index banner inside White Grid
        ctx.fillStyle = selectedTemplate.gradientFrom;
        ctx.beginPath();
        ctx.roundRect((canvas.width - 190) / 2, 510, 190, 52, 16);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'black 22px system-ui, sans-serif';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText(`TABLE ${tabNode}`, canvas.width / 2, 536);

        // Directions text below QR code
        ctx.fillStyle = '#555559';
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.fillText('1. SCAN QR  •  2. BROWSE RECIPES  •  3. INSTANT COOKING', canvas.width / 2, 605);
        ctx.font = '500 11px system-ui, sans-serif';
        ctx.fillText('Secured by Urban Diner Contactless Server Engine', canvas.width / 2, 630);

        // Slogan / Greeting text at footer
        ctx.fillStyle = selectedTemplate.textColor;
        ctx.font = '500 14px system-ui, sans-serif';
        ctx.textBaseline = 'bottom';
        ctx.fillText(currentSub, canvas.width / 2, canvas.height - 45);

        // Download completion handler
        const exportUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `UrbanDiner_Table_${tabNode}_Standee.png`;
        downloadLink.href = exportUrl;
        downloadLink.click();

        toast.dismiss('export-prog');
        toast.success(`Table ${tabNode} standee exported!`);
      };
      qrImage.src = base64Source;
    }).catch(error => {
      console.error(error);
      toast.dismiss('export-prog');
      toast.error('Failed generating canvas.');
    });
  };

  // Printing Layout generator
  const triggerPrintFrame = () => {
    toast.loading('Preparing Print Queue...', { id: 'print-prog' });

    // Generate accurate HTML standees to write dynamically into a sandboxed print iframe
    const tablesToPrint = batchMode 
      ? Array.from({ length: batchEnd - batchStart + 1 }, (_, i) => String(batchStart + i))
      : [tableInput];

    // Read async QR URLs for all tables before launching print
    Promise.all(
      tablesToPrint.map(async tab => {
        const urlText = getDineInUrl(tab);
        const qrMatrix = await QRCode.toDataURL(urlText, {
          errorCorrectionLevel: 'H',
          margin: 1,
          width: 320,
          color: { dark: dotColor, light: '#FFFFFF' }
        });
        return { table: tab, qr: qrMatrix };
      })
    ).then(items => {
      let htmlString = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Print Table Standees</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700;900&display=swap');
            body { 
              margin: 0; 
              padding: 0; 
              background: #FFF; 
              font-family: 'Poppins', sans-serif; 
              color: #2D2926;
            }
            .page-break {
              page-break-after: always;
            }
            .standee-card {
              box-sizing: border-box;
              width: 13.5cm;
              height: 19cm;
              margin: 1cm auto;
              background: linear-gradient(135deg, ${selectedTemplate.gradientFrom}, ${selectedTemplate.gradientTo});
              border: 5px solid ${selectedTemplate.textColor};
              padding: 24px;
              color: #FFF;
              position: relative;
              box-shadow: 0 4px 10px rgba(0,0,0,0.1);
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              text-align: center;
              border-radius: 20px;
            }
            .header-text {
              font-size: 20px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: ${selectedTemplate.textColor};
              margin: 0;
            }
            .header-label {
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 2px;
              color: #FFF;
              background: rgba(255,255,255,0.15);
              padding: 4px 12px;
              border-radius: 99px;
              display: inline-block;
              margin-top: 4px;
            }
            .inner-panel {
              background: #FFF;
              border-radius: 24px;
              padding: 16px;
              margin: 12px 0;
              color: #2D2926;
              box-shadow: 0 4px 12px rgba(0,0,0,0.2);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              flex-grow: 1;
            }
            .qr-wrapper {
              position: relative;
              width: 250px;
              height: 250px;
            }
            .qr-image {
              width: 100%;
              height: 100%;
            }
            .center-logo {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background: #FFF;
              width: 50px;
              height: 50px;
              border-radius: 12px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.15);
              font-size: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              line-height: 1;
              border: 1.5px solid #EBE6E0;
            }
            .table-badge {
              background: ${selectedTemplate.gradientFrom};
              color: #FFF;
              display: inline-block;
              font-size: 18px;
              font-weight: 900;
              padding: 8px 30px;
              border-radius: 12px;
              margin-top: 14px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .instructions {
              font-size: 10px;
              font-weight: 700;
              color: #555559;
              margin-top: 12px;
              letter-spacing: 0.5px;
            }
            .footer-info {
              font-size: 12px;
              font-weight: 600;
              margin: 4px 0 0 0;
              color: ${selectedTemplate.textColor};
            }
          </style>
        </head>
        <body>
          ${items.map((item, idx) => `
            <div class="standee-card ${idx < items.length - 1 ? 'page-break' : ''}">
              <div>
                <h1 class="header-text">${currentHeader}</h1>
                <div class="header-label">⚡ NO APP INSTALL REGISTRATION ⚡</div>
              </div>

              <div class="inner-panel">
                <div class="qr-wrapper">
                  <img src="${item.qr}" class="qr-image" />
                  ${centerLogo ? `<div class="center-logo">${centerLogo}</div>` : ''}
                </div>
                
                <div class="table-badge">TABLE ${item.table}</div>
                <div class="instructions">1. SCAN QR • 2. PICK DELICACIES • 3. PLACED TO KITCHEN</div>
              </div>

              <div>
                <p class="footer-info">${currentSub}</p>
                <div style="font-size:8px; opacity:0.6; margin-top:2px;">Contactless Dine-In QR Standee</div>
              </div>
            </div>
          `).join('')}
          <script>
            window.onload = function() {
              window.focus();
              window.print();
            }
          </script>
        </body>
        </html>
      `;

      // Set inside iframe for native clean sandbox print
      if (printIframeRef.current) {
        const doc = printIframeRef.current.contentDocument || printIframeRef.current.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(htmlString);
          doc.close();
        }
      }

      toast.dismiss('print-prog');
    }).catch(err => {
      console.error(err);
      toast.dismiss('print-prog');
      toast.error('Print queue error.');
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-left">
        <div>
          <h2 className="text-xl font-black text-[#2D2926] leading-tight flex items-center space-x-2">
            <span>Contactless QR Standee Generator</span>
            <span className="text-[9px] bg-[#FF6B00]/10 text-brand-orange px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold font-mono">Premium Creator</span>
          </h2>
          <p className="text-xs text-gray-400">Design UPI-inspired table standees with high scan-rate templates, batch printing, and center logo embeds.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start text-left">
        
        {/* RIGHT COLUMN: LIVE PREVIEW (Col 5) - Pinned layout */}
        <div className="xl:col-span-5 flex flex-col items-center">
          <div className="bg-[#1A1A1A]/5 border border-[#EBE6E0] rounded-[2.5rem] p-6 w-full max-w-[430px] shadow-sm sticky top-24">
            
            <div className="flex items-center justify-between mb-4 border-b border-[#EBE6E0] pb-3">
              <span className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center space-x-1">
                <Eye className="w-3.5 h-3.5 text-brand-orange" />
                <span>Live Standee Preview</span>
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded-full">Scannable Demo</span>
            </div>

            {/* Simulated Printed Standee Card */}
            <div 
              style={{
                background: `linear-gradient(135deg, ${selectedTemplate.gradientFrom}, ${selectedTemplate.gradientTo})`,
                borderColor: selectedTemplate.textColor,
                color: selectedTemplate.textColor
              }}
              className="w-full aspect-[2/2.8] rounded-[2rem] border-4 p-5 flex flex-col justify-between items-center text-center shadow-lg relative overflow-hidden transition-all duration-300"
            >
              {/* Subtle mesh background grid */}
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#FFF_1px,transparent_1px)] [background-size:16px_16px]"></div>

              {/* Title Header */}
              <div className="z-10 w-full mt-2">
                <span className="text-[9px] font-extrabold uppercase bg-white/10 px-3 py-1 rounded-full text-white tracking-widest leading-none">
                  ⚡ FAST contactless order ⚡
                </span>
                <h3 className="text-sm lg:text-base font-black uppercase tracking-wide mt-2 font-sans line-clamp-1">
                  {currentHeader}
                </h3>
              </div>

              {/* Inner White Plate */}
              <div className="bg-white rounded-[1.5rem] p-3.5 w-full z-10 flex flex-col items-center shadow-md border border-[#EBE6E0]">
                {/* QR Code Canvas Mockup */}
                <div className="relative w-44 h-44 flex items-center justify-center p-1 bg-white select-none">
                  {qrBlobUrl ? (
                    <img 
                      src={qrBlobUrl} 
                      alt="Table QR Matrix" 
                      className="w-full h-full object-contain pointer-events-none" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-xl">
                      <RefreshCw className="w-6 h-6 animate-spin text-gray-300" />
                    </div>
                  )}

                  {/* Absolute positioning central image logo helper */}
                  {centerLogo && qrBlobUrl && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-10 h-10 rounded-lg shadow-sm border border-[#EBE6E0] flex items-center justify-center text-xl select-none">
                      {centerLogo}
                    </div>
                  )}
                </div>

                {/* Table Number Pill */}
                <div 
                  style={{ backgroundColor: selectedTemplate.gradientFrom }}
                  className="px-6 py-2 rounded-xl text-white font-black text-xs uppercase tracking-wider -mt-1 shadow-sm font-sans"
                >
                  Table {tableInput || '3'}
                </div>

                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-3">
                  1. Scan  •  2. Order Meals  •  3. Instant Cooking
                </p>
              </div>

              {/* Footer text */}
              <div className="z-10 mb-2 w-full px-2">
                <p className="text-[10px] font-bold tracking-tight opacity-90 line-clamp-2 leading-relaxed">
                  {currentSub}
                </p>
              </div>
            </div>

            {/* Quick Actions widget */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => triggerDownloadPNG(tableInput)}
                className="flex items-center justify-center space-x-2 bg-[#2D2926] hover:bg-[#1A1A1A] text-white py-3 px-4 rounded-xl text-xs font-black transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </button>
              <button
                onClick={triggerPrintFrame}
                className="flex items-center justify-center space-x-2 bg-brand-orange hover:bg-brand-orange-hover text-white py-3 px-4 rounded-xl text-xs font-black transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Quick Print</span>
              </button>
            </div>
            
          </div>
        </div>

        {/* LEFT COLUMN: CONTROL SUITE (Col 7) */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* Card 1: Configuration Target */}
          <div className="bg-white border border-[#EBE6E0] p-6 rounded-[2rem] shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-[#EBE6E0] pb-3">
              <Settings className="w-5 h-5 text-brand-orange" />
              <h3 className="text-sm font-black text-[#2D2926] uppercase">Index Target Selection</h3>
            </div>

            {/* Toggle Switch between Single & Batch */}
            <div className="grid grid-cols-2 gap-2 bg-[#F4F1EE] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setBatchMode(false)}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${!batchMode ? 'bg-white text-[#2D2926] shadow-sm' : 'text-gray-500 hover:text-black'}`}
              >
                <Hash className="w-3.5 h-3.5" />
                <span>Single Table QR</span>
              </button>
              <button
                type="button"
                onClick={() => setBatchMode(true)}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${batchMode ? 'bg-white text-[#2D2926] shadow-sm' : 'text-gray-500 hover:text-black'}`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Batch Generator (1-N)</span>
              </button>
            </div>

            {!batchMode ? (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500">Physical Table Name / Index</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={tableInput}
                    onChange={(e) => setTableInput(e.target.value)}
                    placeholder="E.g. 5, 12, VIP-1"
                    maxLength={10}
                    className="bg-[#F4F1EE] border border-[#EBE6E0] text-[#2D2926] font-sans rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-brand-orange transition flex-grow font-bold"
                  />
                  <div className="flex space-x-1">
                    {['3', '5', '10', 'A1'].map((quickIndex) => (
                      <button
                        key={quickIndex}
                        onClick={() => setTableInput(quickIndex)}
                        className={`px-3 py-2 border rounded-xl text-xs font-bold transition ${tableInput === quickIndex ? 'border-brand-orange bg-brand-orange/10 text-brand-orange' : 'border-[#EBE6E0] hover:bg-[#F4F1EE]'}`}
                      >
                        {quickIndex}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-gray-400">Your table QR launches instantly under: <code className="bg-[#F4F1EE] px-1 py-0.5 rounded text-gray-600 font-mono">{getDineInUrl(tableInput || '3')}</code></p>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Start Table ID</label>
                    <input
                      type="number"
                      value={batchStart}
                      min={1}
                      max={100}
                      onChange={(e) => setBatchStart(Number(e.target.value))}
                      className="w-full bg-[#F4F1EE] border border-[#EBE6E0] text-[#2D2926] rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">End Table ID</label>
                    <input
                      type="number"
                      value={batchEnd}
                      min={batchStart}
                      max={100}
                      onChange={(e) => setBatchEnd(Number(e.target.value))}
                      className="w-full bg-[#F4F1EE] border border-[#EBE6E0] text-[#2D2926] rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 rounded-2xl p-4 text-xs">
                  <p className="font-bold flex items-center space-x-1.5">
                    <span>⚡ Printer Automation Mode Active</span>
                  </p>
                  <p className="mt-1 leading-relaxed text-[11px] text-gray-600">
                    This will print standees for tables <span className="font-bold">{batchStart} through {batchEnd}</span> ({batchEnd - batchStart + 1} standees total). Each standee will launch on its own formatted sheet automatically.
                  </p>
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={triggerPrintFrame}
                    className="flex-1 bg-brand-orange hover:bg-brand-orange-hover text-white py-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Batch Standees ({batchEnd - batchStart + 1})</span>
                  </button>
                  <button
                    onClick={() => {
                      // Trigger continuous sequential canvas generators
                      toast.promise(
                        new Promise<void>(async (resolve, reject) => {
                          try {
                            for (let t = batchStart; t <= batchEnd; t++) {
                              triggerDownloadPNG(String(t));
                              // short sleep to prevent browser blocks
                              await new Promise(r => setTimeout(r, 600));
                            }
                            resolve();
                          } catch (e) {
                            reject(e);
                          }
                        }),
                        {
                          loading: 'Downloading sequential items...',
                          success: 'Batch download finished!',
                          error: 'Failed sequential downloads.'
                        }
                      );
                    }}
                    className="flex-1 border border-[#EBE6E0] hover:bg-[#F4F1EE] py-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 text-gray-700 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download All (As PNGs)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Custom Frame Layout (PhonePe, Luxury, etc.) */}
          <div className="bg-white border border-[#EBE6E0] p-6 rounded-[2rem] shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-[#EBE6E0] pb-3">
              <Palette className="w-5 h-5 text-brand-orange" />
              <h3 className="text-sm font-black text-[#2D2926] uppercase">Inbuilt Frame Layout (Select One)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {FRAME_TEMPLATES.map((temp) => (
                <button
                  key={temp.id}
                  onClick={() => {
                    setSelectedTemplate(temp);
                    // Match center logo with template's vibe default if desired
                    setCenterLogo(temp.logo);
                  }}
                  className={`border-[2px] rounded-2xl p-4 text-left transition relative cursor-pointer ${selectedTemplate.id === temp.id ? 'border-brand-orange bg-brand-orange/[0.02]' : 'border-[#EBE6E0] hover:border-gray-300'}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black text-gray-800 tracking-tight block">{temp.name}</span>
                    {selectedTemplate.id === temp.id && (
                      <span className="bg-brand-orange text-white rounded-full p-0.5"><Check className="w-3.5 h-3.5" /></span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1.5 mt-2.5">
                    <span style={{ backgroundColor: temp.gradientFrom }} className="w-4 h-4 rounded-full inline-block border border-white"></span>
                    <span style={{ backgroundColor: temp.gradientTo }} className="w-4 h-4 rounded-full inline-block border border-white"></span>
                    <span className="text-[10px] text-gray-400 font-bold block ml-1">Eatery Accent Palette</span>
                  </div>

                  <p className="text-[10px] text-gray-400 mt-2 italic">"{temp.headerText}"</p>
                </button>
              ))}
            </div>
          </div>

          {/* Card 3: Custom Branding texts */}
          <div className="bg-white border border-[#EBE6E0] p-6 rounded-[2rem] shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-[#EBE6E0] pb-3">
              <Type className="w-5 h-5 text-brand-orange" />
              <h3 className="text-sm font-black text-[#2D2926] uppercase">Tailor Frame Branding text</h3>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">Custom Heading (Scan Catchphrase)</label>
                <input
                  type="text"
                  placeholder={selectedTemplate.headerText}
                  value={customHeader}
                  onChange={(e) => setCustomHeader(e.target.value)}
                  className="w-full bg-[#F4F1EE] border border-[#EBE6E0] text-[#2D2926] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">Custom Footer Tagline (Conversion Booster)</label>
                <input
                  type="text"
                  placeholder={selectedTemplate.subText}
                  value={customSub}
                  onChange={(e) => setCustomSub(e.target.value)}
                  className="w-full bg-[#F4F1EE] border border-[#EBE6E0] text-[#2D2926] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-orange"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Central QR Code Overlays */}
          <div className="bg-white border border-[#EBE6E0] p-6 rounded-[2rem] shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-[#EBE6E0] pb-3">
              <Sparkles className="w-5 h-5 text-brand-orange" />
              <h3 className="text-sm font-black text-[#2D2926] uppercase">Central Brand Avatar / Logo Choice</h3>
            </div>
            
            <p className="text-[11px] text-gray-400 leading-relaxed">UPI pay standees usually feature bank logos inside. Placing your signature emoji helps the guest build confidence before tapping.</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LOGO_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setCenterLogo(opt.emoji)}
                  className={`border p-2.5 rounded-xl text-left transition flex items-center space-x-2 text-xs font-bold cursor-pointer ${centerLogo === opt.emoji ? 'border-brand-orange bg-brand-orange/5 text-[#2D2926]' : 'border-[#EBE6E0] hover:bg-[#F4F1EE] text-gray-500 hover:text-gray-800'}`}
                >
                  <span className="text-base">{opt.emoji || '❌'}</span>
                  <span className="truncate text-[11px]">{opt.label}</span>
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-[#EBE6E0] grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">Matrix Dot Accent Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={dotColor}
                    onChange={(e) => setDotColor(e.target.value)}
                    className="w-10 h-10 border border-gray-200 rounded-lg cursor-pointer bg-transparent"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-600 font-mono text-left block">{dotColor}</span>
                    <span className="text-[9px] text-gray-400">Main QR pixels contrast</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">Error Correction redundancy</label>
                <div className="flex bg-[#F4F1EE] p-0.5 rounded-xl border border-[#EBE6E0]">
                  {['L', 'M', 'Q', 'H'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setErrorCorrection(lvl as any)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${errorCorrection === lvl ? 'bg-white text-brand-orange shadow-sm' : 'text-gray-400 hover:text-gray-800'}`}
                    >
                      {lvl === 'H' ? 'High (H)' : lvl}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-gray-400 mt-2 text-left">Level 'H' allows up to 30% QR print damage or center logo cover-up while remaining scanned.</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Invisible print sandbox target */}
      <iframe 
        ref={printIframeRef} 
        style={{ position: 'absolute', width: '0px', height: '0px', left: '-500px', top: '-500px' }} 
        title="DineIn QR Standee Printer Sandbox"
      />
    </div>
  );
}
