import React, { forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="input-label">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="input-icon-wrapper">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "input-field",
              icon && "pl-10",
              error && "input-field-error",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <p className="input-error-msg">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="input-label">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            "textarea-field",
            error && "textarea-field-error",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="input-error-msg">{error}</p>}
      </div>
    );
  }
);
TextArea.displayName = "TextArea";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="checkbox-wrapper">
        <input
          type="checkbox"
          className={cn(
            "checkbox-input",
            className
          )}
          ref={ref}
          {...props}
        />
        {label && (
          <label className="checkbox-label" onClick={(e) => e.preventDefault()}>
            {label}
          </label>
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";
