type Status =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'draft'
  | 'sent'
  | 'accepted'
  | 'rejected'
  | 'paid'
  | 'overdue';

const statusConfig: Record<Status, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
  in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Cancelled', className: 'bg-slate-100 text-slate-600' },
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-600' },
  sent: { label: 'Sent', className: 'bg-blue-100 text-blue-700' },
  accepted: { label: 'Accepted', className: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-600' },
  paid: { label: 'Paid', className: 'bg-emerald-100 text-emerald-700' },
  overdue: { label: 'Overdue', className: 'bg-red-100 text-red-600' },
};

export default function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}
