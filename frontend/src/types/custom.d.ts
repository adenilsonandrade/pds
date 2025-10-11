declare module '*.css';
declare module '*.png';
declare module '*.jpg';

declare module 'lucide-react@*' {
  const anyExport: any;
  export = anyExport;
}

declare module '@radix-ui/*@*' {
  const anyExport: any;
  export = anyExport;
}

declare module 'class-variance-authority@*' {
  const anyExport: any;
  export = anyExport;
}

declare module 'sonner@*' {
  const anyExport: any;
  export = anyExport;
}

declare module 'next-themes@*' {
  const anyExport: any;
  export = anyExport;
}

// Wildcard: pacote@version imports
declare module '*@*' {
  const anyExport: any;
  export = anyExport;
}

// Motion easing/variants helpers fallback
declare namespace MotionFallback {
  type Easing = any;
  type Variants = Record<string, any>;
  type Transition = any;
}

declare module 'motion' {
  export const motion: any;
  export type Variants = MotionFallback.Variants;
}
