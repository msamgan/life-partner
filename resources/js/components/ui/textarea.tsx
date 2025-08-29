import * as React from 'react';

export function Textarea(props: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={
        'flex h-24 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
      }
      {...props}
    />
  );
}

export default Textarea;
