import { useEmblaCarousel } from "embla-carousel-react";

declare module "embla-carousel-react" {
    import { ComponentType } from "react";
  
    interface UseEmblaCarouselOptions {
      loop?: boolean;
      speed?: number;
      axis?: "x" | "y";
      [key: string]: any; // Include additional properties if required
    }
  
    export type UseEmblaCarouselReturnType = [
      React.RefObject<HTMLDivElement>, // carousel ref
      {
        scrollPrev: () => void;
        scrollNext: () => void;
        canScrollPrev: () => boolean;
        canScrollNext: () => boolean;
        on: (event: string, handler: () => void) => void;
        off: (event: string, handler: () => void) => void;
      }
    ];
  
    export function useEmblaCarousel(
      options: UseEmblaCarouselOptions,
      plugins?: any[]
    ): UseEmblaCarouselReturnType;
  }
  
  