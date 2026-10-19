import {
    FaCheckCircle,
    FaClock,
    FaExclamationTriangle,
    FaLock,
    FaTimesCircle,
    FaClipboardCheck,
} from "react-icons/fa";

function StatusBadge({ status }) {
  let badgeClass = "";
  let icon = null;

  switch (status) {
    case "CREATED":
      badgeClass = "bg-blue-100 text-blue-700";
      icon = <FaClock />;
      break;

    case "FUNDED":
      badgeClass = "bg-yellow-100 text-yellow-700";
      icon = <FaLock />;
      break;

    case "COMPLETED":
      badgeClass = "bg-purple-100 text-purple-700";
      icon = <FaClipboardCheck />;
      break;

    case "RELEASED":
      badgeClass = "bg-green-100 text-green-700";
      icon = <FaCheckCircle />;
      break;

    case "DISPUTED":
      badgeClass = "bg-red-100 text-red-700";
      icon = <FaExclamationTriangle />;
      break;

    case "CANCELLED":
      badgeClass = "bg-red-100 text-red-700";
      icon = <FaTimesCircle />;
      break;

    default:
      badgeClass = "bg-gray-100 text-gray-700";
  }

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${badgeClass}`}
    >
      {icon}
      {status}
    </span>
  );
}

export default StatusBadge;