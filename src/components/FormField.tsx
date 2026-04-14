import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

export default function FormField({ label, required, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, className = '', ...props }: InputProps) {
  return (
    <input
      className={`w-full px-3 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 bg-white transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
        ${error ? 'border-red-400' : 'border-slate-200'}
        ${className}`}
      {...props}
    />
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({ error, className = '', ...props }: TextareaProps) {
  return (
    <textarea
      className={`w-full px-3 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 bg-white transition-colors resize-none
        focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
        ${error ? 'border-red-400' : 'border-slate-200'}
        ${className}`}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export function Select({ error, className = '', children, ...props }: SelectProps) {
  return (
    <select
      className={`w-full px-3 py-2.5 rounded-xl border text-sm text-slate-800 bg-white transition-colors appearance-none
        focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
        ${error ? 'border-red-400' : 'border-slate-200'}
        ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
