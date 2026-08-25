import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20 bg-white font-inter">
      <p className="text-[100px] md:text-[140px] font-bold text-[#f26b31]/20 font-outfit leading-none select-none">
        404
      </p>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-outfit mt-2 mb-3 text-center">
        Page Not Found
      </h1>
      <p className="text-gray-500 text-center max-w-md mb-8 text-[15px]">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-block px-8 py-3 bg-[#f26b31] text-white font-semibold rounded-md hover:bg-[#e05a20] transition-colors duration-200 text-[15px]"
      >
        Back to Home
      </Link>
    </div>
  );
}
