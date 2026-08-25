"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { User, Phone as PhoneIcon, FileText } from "lucide-react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const DEFAULT_MAP =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3579.0282384149446!2d78.1761250746619!3d26.228271989170217!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3976c70014f49549%3A0x6a7bececea3dbcec!2sOm%20Residency!5e0!3m2!1sen!2sin!4v1785324555204!5m2!1sen!2sin";

export default function ContactSection({ initialMapUrl }: { initialMapUrl?: string }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    message: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [mapUrl, setMapUrl] = useState(initialMapUrl || DEFAULT_MAP);

  useEffect(() => {
    const fetchSettings = () => {
      fetch(`${BACKEND}/api/settings`)
        .then((r) => r.json())
        .then((json) => {
          if (json.data?.mapEmbedUrl) setMapUrl(json.data.mapEmbedUrl);
        })
        .catch(() => {});
    };
    // Only refresh on focus (admin CMS preview), not on mount — SSR provides initial data
    window.addEventListener("focus", fetchSettings);
    return () => window.removeEventListener("focus", fetchSettings);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      setErrorMessage("Enter valid email");
      return;
    }

    if (!/^[0-9]{10,15}$/.test(phone)) {
      setErrorMessage("Enter valid phone number");
      return;
    }

    Swal.fire({
      title: "Please Wait...",
      text: "Sending your message",
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); },
    });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, company_name: companyName, message }),
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
    <section id="contact-us" className="py-12 sm:py-20 bg-white font-outfit">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12">

        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark relative inline-block pb-3">
            Contact <span className="text-brand-orange">Us</span>
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#efad05] rounded-full" />
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">

          {/* Left: Map — key forces reload when URL changes */}
          <div className="w-full min-h-[260px] sm:min-h-[340px] lg:min-h-[500px] rounded-2xl overflow-hidden border border-gray-200 shadow-lg relative">
            <iframe
              key={mapUrl}
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full"
            />
          </div>

          {/* Right: Form */}
          <div className="bg-brand-light p-8 sm:p-10 rounded-2xl border border-gray-100 shadow-lg flex flex-col justify-center">
            <form onSubmit={handleSubmit} className="space-y-6">

              {errorMessage && (
                <div className="text-red-500 font-inter text-sm font-semibold bg-red-50 border border-red-200 px-4 py-2.5 rounded-lg text-center">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 pl-12 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition duration-200 placeholder-gray-400 font-inter text-sm"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <User className="h-5 w-5" />
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 pl-12 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition duration-200 placeholder-gray-400 font-inter text-sm"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Envelope className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="relative">
                  <input
                    type="text"
                    id="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 pl-12 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition duration-200 placeholder-gray-400 font-inter text-sm"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <PhoneIcon className="h-5 w-5" />
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    id="companyName"
                    placeholder="Company Name"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 pl-12 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition duration-200 placeholder-gray-400 font-inter text-sm"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <FileText className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="relative">
                <textarea
                  id="message"
                  placeholder="Your Message.."
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 pl-12 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition duration-200 placeholder-gray-400 font-inter text-sm resize-none"
                />
                <div className="absolute left-4 top-5 text-gray-400">
                  <Comment className="h-5 w-5" />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="relative overflow-hidden w-full sm:w-auto bg-brand-dark text-white px-12 py-4 font-bold text-sm tracking-wide rounded-full shadow-md border border-brand-dark transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-100 animate-shine"
                >
                  Submit
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </section>
  );
}

function Envelope(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function Comment(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
