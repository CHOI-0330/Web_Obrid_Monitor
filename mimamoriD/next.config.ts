import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Map version-suffixed imports from mimamoriD to actual packages
      "lucide-react@0.487.0": "lucide-react",
      "@radix-ui/react-select@2.1.6": "@radix-ui/react-select",
      "@radix-ui/react-switch@1.1.3": "@radix-ui/react-switch",
      "@radix-ui/react-dialog@1.1.6": "@radix-ui/react-dialog",
      "embla-carousel-react@8.6.0": "embla-carousel-react",
      "@radix-ui/react-dropdown-menu@2.1.6": "@radix-ui/react-dropdown-menu",
      "class-variance-authority@0.7.1": "class-variance-authority",
      "@radix-ui/react-hover-card@1.1.6": "@radix-ui/react-hover-card",
      "@radix-ui/react-collapsible@1.1.3": "@radix-ui/react-collapsible",
      "@radix-ui/react-tooltip@1.1.8": "@radix-ui/react-tooltip",
      "recharts@2.15.2": "recharts",
      "@radix-ui/react-checkbox@1.1.4": "@radix-ui/react-checkbox",
      "@radix-ui/react-label@2.1.2": "@radix-ui/react-label",
      "@radix-ui/react-slot@1.1.2": "@radix-ui/react-slot",
      "react-hook-form@7.55.0": "react-hook-form",
      "vaul@1.1.2": "vaul",
      "@radix-ui/react-tabs@1.1.3": "@radix-ui/react-tabs",
      "@radix-ui/react-toggle-group@1.1.2": "@radix-ui/react-toggle-group",
      "input-otp@1.4.2": "input-otp",
      "@radix-ui/react-toggle@1.1.2": "@radix-ui/react-toggle",
      "@radix-ui/react-context-menu@2.2.6": "@radix-ui/react-context-menu",
      "@radix-ui/react-accordion@1.2.3": "@radix-ui/react-accordion",
      "cmdk@1.1.1": "cmdk",
      "sonner@2.0.3": "sonner",
      "@radix-ui/react-alert-dialog@1.1.6": "@radix-ui/react-alert-dialog",
      "@radix-ui/react-avatar@1.1.3": "@radix-ui/react-avatar",
      "@radix-ui/react-scroll-area@1.2.3": "@radix-ui/react-scroll-area",
      "@radix-ui/react-progress@1.1.2": "@radix-ui/react-progress",
      "@radix-ui/react-radio-group@1.2.3": "@radix-ui/react-radio-group",
      "@radix-ui/react-popover@1.1.6": "@radix-ui/react-popover",
      "@radix-ui/react-navigation-menu@1.2.5": "@radix-ui/react-navigation-menu",
      "react-day-picker@8.10.1": "react-day-picker",
      "react-resizable-panels@2.1.7": "react-resizable-panels",
      "@radix-ui/react-slider@1.2.3": "@radix-ui/react-slider",
    };
    return config;
  },
};

export default nextConfig;
