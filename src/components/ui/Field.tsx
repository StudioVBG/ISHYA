import { forwardRef } from "react";
import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

const baseClass =
  "w-full px-3 py-2 border border-border rounded-lg text-sm bg-white text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta disabled:opacity-50 disabled:cursor-not-allowed";

const errorClass = "border-destructive focus:ring-destructive/20 focus:border-destructive";

interface LabelWrapperProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FieldLabel({
  label,
  hint,
  error,
  required,
  children,
  className,
}: LabelWrapperProps) {
  return (
    <label className={cn("block", className)}>
      {label && (
        <span className="block text-xs font-medium text-foreground mb-1">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </span>
      )}
      {children}
      {error ? (
        <span className="block text-xs text-destructive mt-1">{error}</span>
      ) : hint ? (
        <span className="block text-xs text-muted mt-1">{hint}</span>
      ) : null}
    </label>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(baseClass, invalid && errorClass, className)}
      {...rest}
    />
  );
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, invalid, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(baseClass, "resize-y", invalid && errorClass, className)}
        {...rest}
      />
    );
  },
);

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid, children, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(baseClass, invalid && errorClass, className)}
      {...rest}
    >
      {children}
    </select>
  );
});

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ className, label, ...rest }, ref) {
    return (
      <label className="inline-flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
        <input
          ref={ref}
          type="checkbox"
          className={cn("rounded accent-terracotta", className)}
          {...rest}
        />
        {label}
      </label>
    );
  },
);
