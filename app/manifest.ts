import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Foresight Launcher",
    short_name: "Foresight",
    description: "Private match radar launcher and session terminal.",
    start_url: "/launcher",
    display: "standalone",
    background_color: "#05070a",
    theme_color: "#05070a",
  };
}
