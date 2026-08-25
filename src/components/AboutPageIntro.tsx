"use client";

import { useState, useEffect } from "react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const DEFAULTS = {
  businessName: "Ramdas Power Innovations",
  city: "Indore",
  state: "Madhya Pradesh",
};

export default function AboutPageIntro() {
  const [s, setS] = useState(DEFAULTS);

  useEffect(() => {
    const fetchSettings = () => {
      fetch(`${BACKEND}/api/settings`)
        .then((r) => r.json())
        .then((json) => {
          if (!json.data) return;
          setS({
            businessName: json.data.businessName || DEFAULTS.businessName,
            city: json.data.city || DEFAULTS.city,
            state: json.data.state || DEFAULTS.state,
          });
        })
        .catch(() => {});
    };
    fetchSettings();
    window.addEventListener("focus", fetchSettings);
    return () => window.removeEventListener("focus", fetchSettings);
  }, []);

  return (
    <>
      <p className="text-justify mb-4">
        {s.businessName} is a trusted and professionally managed electrical solution
        provider based in {s.city}, {s.state}. As an Authorized Distributor of Schneider
        Electric Low Voltage Switchgears, we specialize in delivering high-quality,
        reliable, and energy-efficient electrical distribution products that meet global
        standards of safety and performance.
      </p>
      <p className="text-justify mb-10">
        With an unwavering commitment to excellence, strong industry experience, and a
        customer-first approach, we have become a preferred supplier for industries,
        commercial establishments, and infrastructure projects across the region.
      </p>
    </>
  );
}
