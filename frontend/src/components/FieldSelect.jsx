import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const triggerCls =
  "w-full rounded-xl border border-input bg-white px-4 py-3 h-auto text-sm text-brand-ink text-left focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green transition data-[placeholder]:text-brand-ink/70";

export const FieldSelect = ({ id, value, onChange, options, testId, placeholder = "Select one" }) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger id={id} className={triggerCls} data-testid={testId}>
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent className="bg-white border-input" data-testid={testId ? `${testId}-options` : undefined}>
      {options.map((o) => (
        <SelectItem
          key={o}
          value={o}
          className="text-brand-ink focus:bg-brand-sage focus:text-brand-green cursor-pointer"
          data-testid={testId ? `${testId}-option-${o.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : undefined}
        >
          {o}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);
