"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { MapPin, Phone, MessageCircle } from "lucide-react";

const DEFAULT_MAP =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3579.0282384149446!2d78.1761250746619!3d26.228271989170217!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3976c70014f49549%3A0x6a7bececea3dbcec!2sOm%20Residency!5e0!3m2!1sen!2sin!4v1785324555204!5m2!1sen!2sin";

interface ContactInfo {
  phone: string;
  whatsapp: string;
  address: string;
  mapEmbedUrl: string;
}

const DEFAULTS: ContactInfo = {
  phone: "+91 9691708989",
  whatsapp: "919691708989",
  address: "B-72, Om Residency, Tansen Nagar, Gwalior, Madhya Pradesh (M.P.) 474002",
  mapEmbedUrl: DEFAULT_MAP,
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    message: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [info, setInfo] = useState<ContactInfo>(DEFAULTS);

  useEffect(() => {
    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    const fetchSettings = () => {
      fetch(`${BACKEND}/api/settings`)
        .then((r) => r.json())
        .then((json) => {
          if (!json.data) return;
          const d = json.data;
          const addrParts = [
            d.address,
            d.city && d.pincode
              ? `${d.city} ${d.pincode}`
              : d.city || d.pincode,
          ].filter(Boolean);
          setInfo({
            phone: d.phone || DEFAULTS.phone,
            whatsapp: d.whatsapp || DEFAULTS.whatsapp,
            address: addrParts.join(", ") || DEFAULTS.address,
            mapEmbedUrl: d.mapEmbedUrl || DEFAULTS.mapEmbedUrl,
          });
        })
        .catch(() => { });
    };

    fetchSettings();
    // Re-fetch when user switches back to this tab after saving in admin
    window.addEventListener("focus", fetchSettings);
    return () => window.removeEventListener("focus", fetchSettings);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const { name, email, phone, companyName, message } = formData;

    if (!name || !email || !phone || !companyName || !message) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all fields",
        confirmButtonColor: "#FF6A00",
      });
      return;
    }

    if (name.trim().length < 3) {
      setErrorMessage("Name must be at least 3 characters");
      return;
    }

    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    if (!email.match(emailPattern)) {
      setErrorMessage("Enter a valid email address");
      return;
    }

    if (!/^[0-9]{10,15}$/.test(phone)) {
      setErrorMessage("Enter a valid phone number (10-15 digits)");
      return;
    }

    Swal.fire({
      title: "Please Wait...",
      text: "Sending your message",
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); },
    });

    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${BACKEND_URL}/api/enquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          company_name: companyName,
          message,
        }),
      });

      const result = await response.json();

      if (result.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Mail Sent Successfully",
          timer: 5000,
          showConfirmButton: false,
        });
        setFormData({ name: "", email: "", phone: "", companyName: "", message: "" });
      } else {
        Swal.fire({
          icon: "error",
          title: "Mail Failed",
          text: result.message || "Failed to deliver mail",
          confirmButtonColor: "#FF6A00",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Please try again later",
        confirmButtonColor: "#FF6A00",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9fb] font-inter">
      {/* Breadcrumb Banner */}
      <div className="relative overflow-hidden">
        <img
          src="/images/image-banner/contact-us.png"
          alt=""
          aria-hidden="true"
          className="w-full block h-auto sm:h-[300px] md:h-[360px] lg:h-[420px] sm:object-cover sm:object-center"
        />
        <div className="absolute inset-0 bg-white/55" />
        <div className="absolute inset-0 flex items-end z-10">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16 pb-4 sm:pb-[50px] font-outfit">
            <h1 className="text-2xl sm:text-4xl md:text-[42px] font-bold text-gray-900 font-outfit mb-3 leading-tight">
              Contact <span className="text-[#f26b31]">Us</span>
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-700">
              <Link href="/" className="hover:text-[#f26b31] transition-colors">Home</Link>
              <span className="text-gray-500 font-bold text-xs">»»</span>
              <span className="text-gray-800 font-bold">Contact Us</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Boxes */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Address */}
          <div className="flex-1 min-w-[250px] bg-white p-6 sm:p-[30px] rounded-[10px] shadow-[0_5px_15px_rgba(0,0,0,0.1)] text-center flex flex-col items-center">
            <MapPin className="h-[30px] w-[30px] text-[#ff6600] mb-[15px]" />
            <h3 className="text-xl font-bold text-[#333] mb-[10px] font-outfit">Address</h3>
            <p className="text-[#555] leading-[1.6] text-sm max-w-[280px]">{info.address}</p>
          </div>

          {/* Phone */}
          <div className="flex-1 min-w-[250px] bg-white p-6 sm:p-[30px] rounded-[10px] shadow-[0_5px_15px_rgba(0,0,0,0.1)] text-center flex flex-col items-center">
            <Phone className="h-[30px] w-[30px] text-[#ff6600] mb-[15px]" />
            <h3 className="text-xl font-bold text-[#333] mb-[10px] font-outfit">Phone</h3>
            <p className="text-[#555] leading-[1.6] text-sm">
              <a
                href={`tel:${info.phone.replace(/\s/g, "")}`}
                className="text-[#555] hover:text-[#f26b31] transition-colors"
              >
                {info.phone}
              </a>
            </p>
          </div>

          {/* WhatsApp */}
          <div className="flex-1 min-w-[250px] bg-white p-6 sm:p-[30px] rounded-[10px] shadow-[0_5px_15px_rgba(0,0,0,0.1)] text-center flex flex-col items-center">
            <MessageCircle className="h-[30px] w-[30px] text-[#ff6600] mb-[15px]" />
            <h3 className="text-xl font-bold text-[#333] mb-[10px] font-outfit">WhatsApp</h3>
            <p className="text-[#555] leading-[1.6] text-sm">
              <a
                href={`https://wa.me/${info.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#555] hover:text-[#f26b31] transition-colors"
              >
                +{info.whatsapp}
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="bg-white rounded-2xl p-5 sm:p-8 md:p-12 shadow-[0_5px_15px_rgba(0,0,0,0.06)] border border-gray-100/80">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium border border-red-100 text-center">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                className="w-full bg-white border border-gray-200 focus:border-[#f26b31] focus:ring-1 focus:ring-[#f26b31] rounded-lg px-4 py-4 text-sm outline-none transition-all placeholder:text-gray-400 text-gray-800"
              />
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="w-full bg-white border border-gray-200 focus:border-[#f26b31] focus:ring-1 focus:ring-[#f26b31] rounded-lg px-4 py-4 text-sm outline-none transition-all placeholder:text-gray-400 text-gray-800"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone"
                className="w-full bg-white border border-gray-200 focus:border-[#f26b31] focus:ring-1 focus:ring-[#f26b31] rounded-lg px-4 py-4 text-sm outline-none transition-all placeholder:text-gray-400 text-gray-800"
              />
              <input
                type="text"
                id="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Company Name"
                className="w-full bg-white border border-gray-200 focus:border-[#f26b31] focus:ring-1 focus:ring-[#f26b31] rounded-lg px-4 py-4 text-sm outline-none transition-all placeholder:text-gray-400 text-gray-800"
              />
            </div>

            <textarea
              id="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your Message..."
              rows={6}
              className="w-full bg-white border border-gray-200 focus:border-[#f26b31] focus:ring-1 focus:ring-[#f26b31] rounded-lg px-4 py-4 text-sm outline-none transition-all placeholder:text-gray-400 text-gray-800 resize-y"
            />

            <div className="pt-2">
              <button
                type="submit"
                className="rounded-full bg-[#0f1115] hover:bg-[#1f242e] text-white px-10 py-3.5 font-bold text-sm tracking-wider transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Map */}
      <div className="w-full aspect-[16/9] md:aspect-auto md:h-[400px] lg:h-[500px] overflow-hidden border-t border-gray-200 relative bg-gray-100">
        <iframe
          src={info.mapEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0"
        />
      </div>
    </div>
  );
}
