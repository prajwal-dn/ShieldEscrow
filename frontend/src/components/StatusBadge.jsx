import {
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaLock,
  FaTimesCircle,
  FaClipboardCheck,
} from "react-icons/fa";

function StatusBadge({ status, size = "md" }) {
  let badgeStyle = "glow-badge-cyan";
  let dotColor = "bg-cyan-400";
  let icon = <FaClock className="text-xs" />;
  let label = status || "UNKNOWN";

  switch (status) {
    case "CREATED":
      badgeStyle = "glow-badge-cyan";
      dotColor = "bg-cyan-400";
      icon = <FaClock className="text-xs" />;
      label = "Created";
      break;

    case "FUNDED":
      badgeStyle = "glow-badge-amber";
      dotColor = "bg-amber-400";
      icon = <FaLock className="text-xs" />;
      label = "Funded & Locked";
      break;

    case "COMPLETED":
      badgeStyle = "glow-badge-purple";
      dotColor = "bg-purple-400";
      icon = <FaClipboardCheck className="text-xs" />;
      label = "Work Completed";
      break;

    case "RELEASED":
      badgeStyle = "glow-badge-emerald";
      dotColor = "bg-emerald-400";
      icon = <FaCheckCircle className="text-xs" />;
      label = "Funds Released";
      break;

    case "DISPUTED":
      badgeStyle = "glow-badge-rose";
      dotColor = "bg-rose-400";
      icon = <FaExclamationTriangle className="text-xs" />;
      label = "Disputed";
      break;

    case "REFUNDED":
    case "CANCELLED":
      badgeStyle = "glow-badge-amber";
      dotColor = "bg-orange-400";
      icon = <FaTimesCircle className="text-xs" />;
      label = status === "REFUNDED" ? "Refunded to Buyer" : "Cancelled";
      break;

    default:
      badgeStyle = "glass-card-subtle text-slate-300";
      dotColor = "bg-slate-400";
      icon = null;
  }

  const sizeClasses = size === "sm" 
    ? "px-2.5 py-0.5 text-xs font-medium" 
    : "px-3.5 py-1 text-xs font-semibold tracking-wide uppercase";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full backdrop-blur-md transition-all duration-300 ${sizeClasses} ${badgeStyle}`}
    >
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`}></span>
      </span>
      {icon}
      <span>{label}</span>
    </span>
  );
}

export default StatusBadge;