import { useState } from "react";
import api from "../services/api";

function CreateEscrow() {
  const [formData, setFormData] = useState({
    buyerAddress: "",
    sellerAddress: "",
    amount: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    let newErrors = {};

    if (formData.buyerAddress.trim() === "") {
      newErrors.buyerAddress = "Buyer wallet is required";
    }

    if (formData.sellerAddress.trim() === "") {
      newErrors.sellerAddress = "Seller wallet is required";
    }

    if (formData.amount === "" || Number(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (formData.description.trim() === "") {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await api.post("/api/escrows", formData);

      console.log("Escrow Created:", response.data);

      alert("Escrow Created Successfully!");

      setFormData({
        buyerAddress: "",
        sellerAddress: "",
        amount: "",
        description: "",
      });

      setErrors({});
    } catch (error) {
      console.error(error);
      alert("Failed to create escrow.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">

      {/* Page Heading */}

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800">
          Create Escrow
        </h1>

        <p className="text-gray-500 mt-2">
          Securely create a new escrow agreement between buyer and seller.
        </p>
      </div>

      {/* Form Card */}

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* Buyer */}

          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Buyer Wallet Address
            </label>

            <input
              type="text"
              name="buyerAddress"
              value={formData.buyerAddress}
              onChange={handleChange}
              placeholder="Enter buyer wallet address"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {errors.buyerAddress && (
              <p className="text-red-500 text-sm mt-2">
                {errors.buyerAddress}
              </p>
            )}
          </div>

          {/* Seller */}

          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Seller Wallet Address
            </label>

            <input
              type="text"
              name="sellerAddress"
              value={formData.sellerAddress}
              onChange={handleChange}
              placeholder="Enter seller wallet address"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {errors.sellerAddress && (
              <p className="text-red-500 text-sm mt-2">
                {errors.sellerAddress}
              </p>
            )}
          </div>

          {/* Amount */}

          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Escrow Amount
            </label>

            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter escrow amount"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {errors.amount && (
              <p className="text-red-500 text-sm mt-2">
                {errors.amount}
              </p>
            )}
          </div>

          {/* Description */}

          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Description
            </label>

            <textarea
              rows="5"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the work or service..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {errors.description && (
              <p className="text-red-500 text-sm mt-2">
                {errors.description}
              </p>
            )}
          </div>

          {/* Submit Button */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-200 text-white py-3 rounded-xl font-semibold shadow-lg disabled:bg-blue-300"
          >
            {loading ? "Creating Escrow..." : "Create Escrow"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default CreateEscrow;