import { LineItem } from '../types';

interface DocumentPrintTemplateProps {
  documentLabel: 'INVOICE' | 'QUOTATION';
  documentNumber: string;
  issueDate?: string | null;
  dueDateLabel: string;
  dueDate?: string | null;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  items: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string | null;
}

const formatIDR = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function DocumentPrintTemplate({
  documentLabel,
  documentNumber,
  issueDate,
  dueDateLabel,
  dueDate,
  customerName,
  customerEmail,
  customerPhone,
  items,
  subtotal,
  taxRate,
  taxAmount,
  total,
  notes,
}: DocumentPrintTemplateProps) {
  return (
    <div
      className="bg-white text-[#2f2f35]"
      style={{
        width: '794px',
        minHeight: '1123px',
        padding: '42px 44px 46px',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <div className="grid grid-cols-2 gap-8 mb-10">
        <div className="border-l border-[#4a4a4a] pl-6 text-[15px] leading-7">
          <p className="text-[#a68f2d] font-bold text-sm tracking-wide mb-1">FROM:</p>
          <p className="font-semibold text-[30px] leading-none mb-2">WorkOrder Pro</p>
          <p>Jakarta, Indonesia</p>
          <p>support@workorder.app</p>
          <p>+62 812-3456-7890</p>
        </div>
        <div className="border-l border-[#4a4a4a] pl-6 flex justify-between gap-6">
          <div className="text-[15px] leading-7">
            <p className="text-[#a68f2d] font-bold text-sm tracking-wide mb-1">TO:</p>
            <p className="font-bold">{customerName || '-'}</p>
            {customerPhone ? <p>{customerPhone}</p> : null}
            {customerEmail ? <p>{customerEmail}</p> : null}
          </div>
          <div className="w-[130px] h-[86px] border border-[#d6d6d6] text-[#d68a21] font-bold text-center flex items-center justify-center text-xl">
            LOGO
          </div>
        </div>
      </div>

      <h1 className="text-[74px] leading-none font-bold tracking-[1px] mb-8">{documentLabel}</h1>

      <div className="flex flex-wrap gap-x-8 gap-y-2 text-[27px] mb-12">
        <div className="flex items-center gap-3">
          <span className="text-[#a68f2d] font-bold text-base">NO.</span>
          <span>{documentNumber || '-'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#a68f2d] font-bold text-base">DATE:</span>
          <span>{formatDate(issueDate)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#a68f2d] font-bold text-base">{dueDateLabel}:</span>
          <span>{formatDate(dueDate)}</span>
        </div>
      </div>

      <table className="w-full border-collapse mb-10 text-[25px]">
        <thead>
          <tr className="text-left uppercase text-[19px] tracking-wide">
            <th className="border-l border-[#4a4a4a] pl-4 py-3 w-[26%]">Item</th>
            <th className="border-l border-[#4a4a4a] pl-4 py-3 w-[34%]">Description</th>
            <th className="border-l border-[#4a4a4a] text-right pr-4 py-3 w-[12%]">Unit Cost</th>
            <th className="border-l border-[#4a4a4a] text-center py-3 w-[12%]">Qty</th>
            <th className="border-l border-r border-[#4a4a4a] text-right pr-4 py-3 w-[16%]">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id || `${item.description}-${index}`} className="align-top">
              <td className="border-l border-[#4a4a4a] pl-4 py-3 text-[20px]">General Service</td>
              <td className="border-l border-[#4a4a4a] pl-4 py-3 text-[20px]">{item.description || '-'}</td>
              <td className="border-l border-[#4a4a4a] text-right pr-4 py-3 text-[20px]">{formatIDR(item.unit_price)}</td>
              <td className="border-l border-[#4a4a4a] text-center py-3 text-[20px]">{item.qty}</td>
              <td className="border-l border-r border-[#4a4a4a] text-right pr-4 py-3 text-[20px]">{formatIDR(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid grid-cols-[1fr_280px] gap-8 mb-8 text-[20px]">
        <div>
          {notes ? <p className="mb-4">{notes}</p> : null}
          <p className="font-bold mb-2">Terms</p>
          <p>Semua pekerjaan dijamin hingga 30 hari. Hubungi kami jika ada pertanyaan terkait layanan ini.</p>
        </div>
        <div className="border-l border-r border-[#4a4a4a] px-4 py-2 space-y-2">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatIDR(subtotal)}</span></div>
          <div className="flex justify-between"><span>PPN {taxRate}%</span><span>{formatIDR(taxAmount)}</span></div>
          <div className="flex justify-between font-bold text-[24px] pt-3 mt-2 border-t border-[#4a4a4a]">
            <span>Balance Due</span>
            <span className="text-[#a68f2d]">{formatIDR(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
