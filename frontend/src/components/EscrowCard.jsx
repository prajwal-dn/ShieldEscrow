import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";

function EscrowCard({ escrow }) {
  const navigate = useNavigate();

  return (
    <div className="border rounded-xl p-5 shadow-md">

      <h2 className="text-xl font-bold">
        {escrow.description}
      </h2>

      <p className="mt-3">
        💰 Amount: {escrow.amount}
      </p>

      <p className="mt-2">
        👤 Buyer:
      </p>

      <p className="text-gray-500">
        {escrow.buyerAddress}
      </p>

      <p className="mt-2">
        👤 Seller:
      </p>

      <p className="text-gray-500">
        {escrow.sellerAddress}
      </p>

      <div className="mt-4">
        <StatusBadge status={escrow.status} />
      </div>

      <button
        onClick={() => navigate(`/escrow/${escrow.id}`)}
        className="mt-5 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        View Details
      </button>

    </div>
  );
}

export default EscrowCard;