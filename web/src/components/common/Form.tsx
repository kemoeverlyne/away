import { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

interface FormGroupProps {
  label: string;
  error?: string;
  children: ReactNode;
  required?: boolean;
}

export const FormGroup = ({ label, error, children, required = false }: FormGroupProps) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = ({ error, className = '', ...props }: InputProps) => {
  return (
    <input
      className={`
        w-full px-3 py-2 border rounded-lg
        focus:outline-none focus:ring-2 focus:ring-primary-turquoise
        transition-colors duration-200
        ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
        ${error ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-gray-700'}
        ${className}
      `}
      {...props}
    />
  );
};

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = ({ error, options, className = '', ...props }: SelectProps) => {
  return (
    <select
      className={`
        w-full px-3 py-2 border rounded-lg
        focus:outline-none focus:ring-2 focus:ring-primary-turquoise
        transition-colors duration-200
        ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
        ${error ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-gray-700'}
        ${className}
      `}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}; 