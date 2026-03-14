import { initialize } from "@microsoft/power-apps/app";
import { useEffect, type ReactNode } from "react";

export default function PowerProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const initApp = async () => {
      try {
        await initialize();
        console.log("Power Platform SDK initialized successfully");
      } catch (error) {
        console.error("Failed to initialize Power Platform SDK:", error);
      }
    };
    initApp();
  }, []);
  return <>{children}</>;
}
