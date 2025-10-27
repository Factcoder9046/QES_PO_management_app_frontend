// utils/orderViaHelper.ts
export const getOrderViaBadge = (value: string): { label: string; className: string } => {
  const map: Record<string, { label: string; className: string }> = {
    "Indiamart": { label: "I-M", className: "bg-blue-200 text-blue-500" },
    "Trade India": { label: "T-I", className: "bg-green-200 text-green-500" },
    "Self Approach": { label: "S-A", className: "bg-purple-200 text-purple-500" },
    "End Customer": { label: "E-C", className: "bg-orange-200 text-orange-500" },
    "References": { label: "REF", className: "bg-pink-200 text-pink-500" },
    "Re-Seller": { label: "RES", className: "bg-teal-200 text-teal-500" },
    "Client-Reseller": { label: "C-R", className: "bg-yellow-200 text-yellow-500" },
  };

  return map[value] || { label: value, className: "bg-gray-200 text-gray-500" };
};