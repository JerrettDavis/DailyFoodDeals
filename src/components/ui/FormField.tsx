interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

export function FormField({ label, htmlFor, required = false, hint, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-200">
        {label}
        {required && <span className="ml-1 text-orange-300">*</span>}
      </label>
      {children}
      {hint ? <p className="text-xs leading-5 text-gray-500">{hint}</p> : null}
    </div>
  );
}
