'use client'

import React from 'react'
import { Invoice } from '@/lib/types'
import { Company } from '@/lib/auth-context'

interface InvoiceTemplateProps {
  invoice: Invoice
  company: Company
  logoUrl?: string
}

export default function InvoiceTemplate({ invoice, company, logoUrl }: InvoiceTemplateProps) {
  const displayLogo = logoUrl || company.logo
  
  // GST Logic: Determine if Inter-state (IGST) or Intra-state (CGST/SGST)
  const isSameState = company.state?.trim().toLowerCase() === invoice.client.state?.trim().toLowerCase()
  const gstRate = (invoice.taxRate || 0.18) * 100
  
  return (
    <div className="relative p-0 bg-white min-h-[297mm] w-[210mm] font-sans text-slate-950 overflow-hidden print:w-full print:h-auto">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        @media print {
          @page { size: A4; margin: 0; }
          body { margin: 0; }
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 210mm; 
            height: 297mm;
            padding: 0 !important;
            box-shadow: none !important;
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }

        .font-inter { font-family: 'Inter', sans-serif; }
        .gold-gradient-bg {
          background: linear-gradient(135deg, #D4AF37 0%, #F1D279 50%, #D4AF37 100%);
        }
        .gold-border { border-color: #D4AF37; }
        .gold-text { color: #8B7355; }
        .gold-filter {
          filter: brightness(0) saturate(100%) invert(72%) sepia(21%) saturate(2331%) hue-rotate(3deg) brightness(101%) contrast(105%);
        }
      `}</style>
      
      <div className="print-area min-h-[1110px] relative font-inter bg-white">
        {/* WATERMARK */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.08] pointer-events-none">
          {displayLogo ? (
            <div className="w-[600px] h-[600px] flex items-center justify-center">
              <img src={displayLogo} alt="Watermark" className="max-w-full max-h-full object-contain grayscale gold-filter opacity-40" />
            </div>
          ) : (
            <span className="text-[180px] font-black tracking-tighter -rotate-12 text-[#D4AF37]/20 uppercase">{company.name.slice(0, 3)}</span>
          )}
        </div>

        {/* PREMIUM HEADER SECTION */}
        <div className="relative z-10 bg-slate-950 text-white p-10 h-[300px] flex flex-col justify-between overflow-hidden">
           {/* Cinematic Light Effect */}
           <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-white/[0.03] to-transparent" />
           
           <div className="flex justify-between items-start relative z-10">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-[1px] bg-[#D4AF37]" />
                  <p className="text-[9px] font-black uppercase tracking-[0.5em] text-[#D4AF37]">Official Financial Emission</p>
                </div>
                <h1 className="text-7xl font-black italic tracking-tighter leading-none m-0 p-0 text-white opacity-95">INVOICE</h1>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-1">Tax Document # {invoice.invoiceNumber}</p>
              </div>

              <div className="text-right space-y-4 flex flex-col items-end">
                 {displayLogo ? (
                    <div className="h-24 w-48 flex justify-end items-center overflow-hidden">
                       <img src={displayLogo} alt="Logo" className="max-h-full max-w-full object-contain gold-filter brightness-125" />
                    </div>
                 ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#F1D279] rounded-xl ml-auto" />
                 )}
                 <div className="space-y-1">
                    <h2 className="text-xl font-black italic tracking-tighter uppercase text-[#D4AF37] leading-none mb-1">{company.name}</h2>
                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-relaxed max-w-[250px]">
                       <p>{company.address}</p>
                       <p>{company.city}, {company.state} | {company.phone}</p>
                       <div className="flex justify-end gap-3 mt-1.5 font-black">
                          {company.gstNumber && <p className="text-[#D4AF37]">GSTIN: {company.gstNumber}</p>}
                          {company.pan_number && <p className="text-slate-200">PAN: {company.pan_number}</p>}
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="flex justify-between items-end relative z-10">
              <div className="space-y-1">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Settlement Value</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black italic tracking-tighter text-white">₹{invoice.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest italic">INR Consolidated</span>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Issue Date</p>
                 <p className="text-xs font-black text-white italic tracking-widest uppercase">{new Date(invoice.issueDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
              </div>
           </div>
        </div>

        {/* MAIN BODY */}
        <div className="relative z-10 p-10 pb-20">
           {/* CLIENT & DETAILS SPREAD */}
           <div className="grid grid-cols-2 gap-20 pb-10 border-b border-slate-100">
              <div>
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-4 h-[1px] bg-slate-200" />
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">Billing Recipient</p>
                 </div>
                 <h3 className="text-xl font-black italic text-slate-900 mb-3 tracking-tighter uppercase">{invoice.client.name}</h3>
                 <div className="space-y-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                    <p>{invoice.client.address}</p>
                    <p>{invoice.client.city}, {invoice.client.state} {invoice.client.zipCode}</p>
                    <div className="pt-2">
                       <p className="text-slate-900">{invoice.client.email}</p>
                       {invoice.client.gstNumber && <p className="text-[#D4AF37] mt-1 font-black">GSTIN: {invoice.client.gstNumber}</p>}
                    </div>
                 </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                 <div className="flex justify-between items-start">
                    <div>
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">Invoice Node</p>
                       <p className="font-black text-slate-900 tracking-tighter uppercase text-xl italic">{invoice.invoiceNumber}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">Settlement Cycle</p>
                       <p className="text-[10px] font-black text-slate-900 uppercase italic tracking-widest">{invoice.paymentTerms || 'Net 30'}</p>
                    </div>
                 </div>
                 <div className="h-[1px] bg-slate-200" />
                 <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-500 uppercase tracking-[0.2em]">P.O. Reference</span>
                    <span className="font-black text-slate-900 tracking-tighter uppercase italic">{invoice.poNumber || 'TBD-REF-001'}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-500 uppercase tracking-[0.2em]">Maturity Threshold</span>
                    <span className="font-black text-rose-600 tracking-tighter uppercase italic">{new Date(invoice.dueDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                 </div>
              </div>
           </div>

           {/* LINE ITEMS TABLE */}
           <div className="mt-10 min-h-[350px]">
              <table className="w-full">
                 <thead>
                    <tr className="border-b border-slate-950">
                       <th className="pb-4 text-left text-[9px] font-black uppercase tracking-[0.3em] text-slate-950 w-16 px-2">QTY</th>
                       <th className="pb-4 text-left text-[9px] font-black uppercase tracking-[0.3em] text-slate-950">DESCRIPTION OF SERVICES</th>
                       <th className="pb-4 text-right text-[9px] font-black uppercase tracking-[0.3em] text-slate-950 w-32 px-2">UNIT RATE</th>
                       <th className="pb-4 text-right text-[9px] font-black uppercase tracking-[0.3em] text-slate-950 w-32 px-2">YIELD</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {invoice.items.map((item, idx) => (
                      <tr key={idx} className="group">
                        <td className="py-6 text-sm font-black text-slate-950 italic px-2">{item.quantity}</td>
                        <td className="py-6">
                          <p className="text-sm font-black text-slate-950 uppercase italic tracking-tighter mb-1 leading-tight">{item.description}</p>
                          <p className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.3em]">Operational Service Node</p>
                        </td>
                        <td className="py-6 text-right text-sm font-black text-slate-950 font-mono px-2">
                          {item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-6 text-right text-sm font-black text-slate-950 font-mono italic px-2">
                          {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           {/* TOTALS CALCULATION WITH GST BREAKDOWN */}
           <div className="mt-12 grid grid-cols-2 gap-10">
              <div className="space-y-6">
                 {/* Bank Details Section */}
                 {(company.bank_name || company.bank_account) && (
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.5em] mb-4 italic">Settlement Coordinates (Bank)</p>
                       <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-[9px] font-bold uppercase tracking-widest leading-relaxed">
                          <div>
                             <span className="text-slate-400 block mb-0.5">Bank Name</span>
                             <span className="text-slate-900 font-black">{company.bank_name || 'N/A'}</span>
                          </div>
                          <div>
                             <span className="text-slate-400 block mb-0.5">IFSC Protocol</span>
                             <span className="text-slate-900 font-black">{company.bank_ifsc || 'N/A'}</span>
                          </div>
                          <div className="col-span-2">
                             <span className="text-slate-400 block mb-0.5">Account Allocation Number</span>
                             <span className="text-slate-900 font-black tracking-widest">{company.bank_account || 'N/A'}</span>
                          </div>
                          <div className="col-span-2">
                             <span className="text-slate-400 block mb-0.5">Branch Location</span>
                             <span className="text-slate-900 font-black">{company.bank_branch || 'N/A'}</span>
                          </div>
                       </div>
                    </div>
                 )}
                 {invoice.notes && (
                    <div className="px-2">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.5em] mb-2 italic">Special Directives</p>
                       <p className="text-[10px] font-medium text-slate-600 leading-relaxed italic">{invoice.notes}</p>
                    </div>
                 )}
              </div>

              <div className="space-y-5">
                 <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                       <span>Pipeline Subtotal</span>
                       <span className="text-slate-900 font-mono">₹{invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    
                    {/* GST BREAKDOWN */}
                    {invoice.taxAmount > 0 && (
                       <div className="space-y-2 py-2 border-y border-slate-100">
                          {isSameState ? (
                             <>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                                   <span>CGST ({gstRate/2}%)</span>
                                   <span className="text-slate-900 font-mono">₹{(invoice.taxAmount/2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                                   <span>SGST ({gstRate/2}%)</span>
                                   <span className="text-slate-900 font-mono">₹{(invoice.taxAmount/2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                             </>
                          ) : (
                             <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                                <span>IGST ({gstRate}%)</span>
                                <span className="text-slate-900 font-mono">₹{invoice.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                             </div>
                          )}
                       </div>
                    )}
                 </div>

                 <div className="pt-6 flex justify-between items-end border-t-2 border-slate-950">
                    <div className="space-y-1">
                       <p className="text-[9px] font-black text-slate-950 uppercase tracking-[0.5em] italic">Valuated Sum</p>
                       <p className="text-3xl font-black text-slate-950 uppercase italic tracking-tighter">TOTAL</p>
                    </div>
                    <div className="text-right">
                       <p className="text-5xl font-black text-slate-950 tracking-tighter italic leading-none flex items-start justify-end">
                          <span className="text-xl mr-1 mt-1">₹</span>
                          {invoice.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                       </p>
                       <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-2">Authenticated Settlement Unit</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* FOOTER TERMS & SIGNATURE */}
           <div className="mt-20 grid grid-cols-2 gap-16 items-start">
              <div className="space-y-4">
                 <p className="text-[8px] font-black text-slate-950 uppercase tracking-[0.5em] italic">Statutory Declarations</p>
                 <div className="text-[9px] text-slate-500 font-bold leading-relaxed uppercase tracking-widest space-y-3">
                    <p>
                       1. PLEASE REMIT PAYMENT ACCORDING TO THE SETTLEMENT COORDINATES PROVIDED.
                    </p>
                    <p>
                       2. LATE PAYMENTS SUBJECT TO ARCHITECTURAL REVOCATION OR ADMINISTRATIVE PENALTIES.
                    </p>
                    <p>
                       3. THIS IS A COMPUTER GENERATED INSTRUMENT, AUTHENTICATED VIA CLOUD PROTOCOLS.
                    </p>
                 </div>
              </div>
              
              <div className="flex flex-col items-end">
                 <div className="text-right w-full max-w-[250px]">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.5em] mb-8">Authorized Authentication</p>
                    <div className="relative mb-3">
                       {/* Decorative Signature Placeholder */}
                       <div className="absolute -top-12 right-0 w-32 h-12 opacity-10 pointer-events-none">
                          <svg viewBox="0 0 100 40" className="w-full h-full stroke-slate-950 fill-none">
                             <path d="M10,30 Q30,10 50,30 T90,10" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                       </div>
                       <div className="border-b-2 border-slate-950 pb-2">
                          <p className="text-xs font-black text-slate-950 uppercase tracking-widest italic">{company.authorized_signatory || company.name}</p>
                       </div>
                    </div>
                    <p className="text-[10px] font-black text-slate-950 uppercase tracking-[0.3em]">Authorized Signatory</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">For {company.name}</p>
                 </div>
              </div>
           </div>
        </div>

        {/* BOTTOM ACCENT */}
        <div className="absolute bottom-10 left-0 w-full h-2 bg-slate-950 flex">
           <div className="w-1/4 h-full bg-[#D4AF37]" />
           <div className="w-1/4 h-full bg-[#D4AF37]/50" />
        </div>
      </div>
    </div>
  )
}
