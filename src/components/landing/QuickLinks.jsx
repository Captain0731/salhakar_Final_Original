import { useNavigate } from "react-router-dom";

const QuickLinks = () => {
  const navigate = useNavigate();
  
  const links = [
    { label: "Legal Judgment", path: "/judgment-access" },
    { label: "Law Library", path: "/law-library" },
    { label: "Law Mapping", path: "/law-mapping" },
    { label: "Smart Dashboard", path: "/dashboard" },
    
    { label: "YouTube Summarizer", path: "/youtube-summary" },
    { label: "Legal Templates", path: "/legal-template" },
    
   
  ];

  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-row sm:flex-wrap sm:justify-center gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 mt-3 sm:mt-4 md:mt-6 lg:mt-8 px-1 sm:px-2 md:px-4 lg:px-8 max-w-4xl mx-auto">
      {links.map((link, i) => (
        <button
          key={i}
          onClick={() => navigate(link.path)}
          className="w-full sm:w-auto px-2.5 sm:px-3 md:px-4 lg:px-5 xl:px-6 py-2.5 sm:py-2 md:py-2.5 lg:py-3 rounded-lg sm:rounded-full border-2 border-sky-200 
                     text-slate-700 font-medium text-xs sm:text-xs md:text-sm lg:text-base
                     bg-white/70 backdrop-blur-sm
                     hover:bg-gradient-to-r hover:from-sky-500 hover:to-indigo-600 
                     hover:text-white hover:border-sky-500 active:bg-gradient-to-r active:from-sky-500 active:to-indigo-600 
                     active:text-white active:border-sky-500
                     shadow-sm hover:shadow-lg active:shadow-md
                     transform hover:-translate-y-1 active:translate-y-0 transition-all duration-300
                     touch-manipulation"
          style={{ minHeight: '44px' }}
        >
          {link.label}
        </button>
      ))}
    </div>
  );
};

export default QuickLinks;

