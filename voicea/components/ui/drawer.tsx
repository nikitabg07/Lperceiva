"use client";

import * as React from "react";
import { Drawer as MuiDrawer, Button } from "@mui/material";  // Import Material UI's Drawer

import { cn } from "@/lib/utils"; // Utility for classNames

// Drawer Component using Material UI Drawer
const Drawer = ({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => (
  <MuiDrawer
    anchor="bottom"  // You can change the anchor point to 'left', 'right', 'top', or 'bottom'
    open={open}
    onClose={onClose}
    sx={{
      '& .MuiDrawer-paper': {
        borderRadius: '10px', // Rounded corners for the drawer
      },
    }}
  >
    {children}  {/* Place the content of the drawer here */}
  </MuiDrawer>
);

Drawer.displayName = "Drawer";

// Trigger button to open the drawer
const DrawerTrigger = ({ onClick }: { onClick: () => void }) => (
  <Button onClick={onClick}>Open Drawer</Button>
);

const DrawerPortal = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>  // The portal will just render children as-is for this case
);

const DrawerOverlay = ({ onClose }: { onClose: () => void }) => (
  <div
    className="fixed inset-0 z-50 bg-black/80"
    onClick={onClose}  // Close the drawer when the overlay is clicked
  />
);

const DrawerContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div
    className={cn(
      "flex h-auto flex-col rounded-t-[10px] border bg-background",
      className
    )}
  >
    {children}
  </div>
);

const DrawerHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("p-4", className)}>
    {children}
  </div>
);

const DrawerFooter = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("mt-auto p-4", className)}>
    {children}
  </div>
);

export {
  Drawer,
  DrawerTrigger,
  DrawerPortal,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
};
