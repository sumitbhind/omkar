import { Award, ShieldCheck, Tags, Boxes, Truck, Handshake } from "lucide-react";

const cards = [
  {
    Icon: Award,
    title: "25+ Years of Experience",
    description: "Serving the packaging industry with trusted expertise since 2000.",
  },
  {
    Icon: ShieldCheck,
    title: "Premium Quality Products",
    description: "Cello Tapes, Stretch Films, Bubble Rolls & more — all top-grade material.",
  },
  {
    Icon: Tags,
    title: "Competitive Prices",
    description: "Best-in-market pricing without compromising on quality.",
  },
  {
    Icon: Boxes,
    title: "Bulk Order Support",
    description: "Large-volume orders fulfilled with special pricing and priority handling.",
  },
  {
    Icon: Truck,
    title: "On-Time Delivery",
    description: "Reliable, timely dispatch to keep your business running smoothly.",
  },
  {
    Icon: Handshake,
    title: "Trusted Customer Service",
    description: "Dedicated and responsive support at every step of your order.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-12 sm:py-20 bg-brand-light font-outfit">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12">

        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark relative inline-block pb-3">
            Why Choose <span className="text-brand-orange">Us</span>
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#efad05] rounded-full" />
          </h2>
          <p className="mt-4 text-sm sm:text-base text-gray-500 font-inter max-w-xl mx-auto">
            Your trusted packaging partner — reliable quality, fair pricing, and on-time delivery, every time.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card, index) => {
            const Icon = card.Icon;
            return (
              <div
                key={index}
                className="group relative bg-white p-6 sm:p-8 md:p-[35px] rounded-[12px] border border-gray-100 shadow-[0_8px_25px_rgba(0,0,0,0.08)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.15)] hover:-translate-y-[10px] hover:bg-brand-orange transition-all duration-400 ease-out text-center"
              >
                {/* Icon Badge */}
                <div className="mx-auto w-[70px] h-[70px] bg-black rounded-full flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:bg-white group-hover:shadow-[0_7px_29px_rgba(100,100,111,0.2)]">
                  <Icon size={28} className="text-white transition-colors duration-300 group-hover:text-brand-orange" />
                </div>

                {/* Card Title */}
                <h4 className="text-[20px] font-bold text-brand-orange mb-[10px] transition-colors duration-300 group-hover:text-white text-center">
                  {card.title}
                </h4>

                {/* Card Description */}
                <p className="text-[15px] font-inter text-gray-600 leading-[1.6] transition-colors duration-300 group-hover:text-white/90 text-center">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
