import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { deleteProductFromOrderAsync, updateOrderAsync } from "../../../store/Slice/orderSlice";
import { toast } from "react-toastify";

interface Product {
    _id?: string;
    name: string;
    price: number;
    quantity: number;
    remark?: string;
}

interface User {
    username: string;
    employeeId: string;
    userId?: string;
}

interface Order {
    _id: string;
    orderDate: string;
    orderNumber: string;
    createdAt: string;
    clientName: string;
    companyName: string;
    address: string;
    zipCode: string;
    contact: string;
    gstNumber: string;
    estimatedDispatchDate: string;
    status: "pending" | "completed" | "delayed" | "rejected";
    products: Product[];
    generatedBy: User;
    orderThrough: User;
}

interface UserEditPOProps {
    order: Order | null;
    onClose: () => void;
}

export const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "N/A";
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    } catch {
        return "N/A";
    }
};

const UserEditPO: React.FC<UserEditPOProps> = ({ order, onClose }) => {
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        orderNumber: order?.orderNumber || '',
        orderDate: order?.orderDate || '',
        clientName: order?.clientName || "",
        companyName: order?.companyName || "",
        address: order?.address || "",
        zipCode: order?.zipCode || "",
        contact: order?.contact || "",
        gstNumber: order?.gstNumber || "",
        estimatedDispatchDate: order?.estimatedDispatchDate || "",
        status: order?.status || "pending",
        products: order?.products || [],
        generatedBy: {
            username: order?.generatedBy?.username || "",
            employeeId: order?.generatedBy?.employeeId || "",
            userId: order?.generatedBy?.userId || "",
        },
        orderThrough: {
            username: order?.orderThrough?.username || "",
            employeeId: order?.orderThrough?.employeeId || "",
        },
        createdAt: order?.createdAt || ""
    });

    const [showAddProduct, setShowAddProduct] = useState(false);

    const [newProduct, setNewProduct] = useState<Product>({
        name: "",
        price: 0,
        quantity: 0,
        remark: "",
    });

    const handleDeleteProduct = async (productId: string, index: number, productName?: string) => {
        try {
            await dispatch(deleteProductFromOrderAsync({ orderId: order!._id, productId }) as any);
            setFormData((prev) => ({
                ...prev,
                products: prev.products.filter((p) => p._id !== productId),
            }));
            toast.success(`"${productName || 'Product'}" deleted successfully`, { position: "top-right", autoClose: 2000 });
        } catch (err: any) {
            toast.error(err?.message || "Failed to delete product", { position: "top-right", autoClose: 3000 });
        }
    };

    const handleAddProduct = async () => {
        if (!newProduct.name || newProduct.quantity <= 0 || newProduct.price <= 0) {
            toast.error("Please enter valid product details", { position: "top-right", autoClose: 3000 });
            return;
        }
        setFormData((prev) => ({
            ...prev,
            products: [...prev.products, newProduct],
        }));
        setNewProduct({ name: "", price: 0, quantity: 0, remark: "" });
        setShowAddProduct(false);
        toast.success("Product added successfully", { position: "top-right", autoClose: 2000 });
    };

    useEffect(() => {
        if (order) {
            setFormData({
                orderNumber: order.orderNumber || "",
                orderDate: order.orderDate || "",
                clientName: order.clientName || "",
                companyName: order.companyName || "",
                address: order.address || "",
                zipCode: order.zipCode || "",
                contact: order.contact || "",
                gstNumber: order.gstNumber || "",
                estimatedDispatchDate: order.estimatedDispatchDate || "",
                status: order.status || "pending",
                products: order.products || [],
                generatedBy: {
                    username: order.generatedBy?.username || "",
                    employeeId: order.generatedBy?.employeeId || "",
                    userId: order.generatedBy?.userId || "",
                },
                orderThrough: {
                    username: order.orderThrough?.username || "",
                    employeeId: order.orderThrough?.employeeId || "",
                },
                createdAt: order.createdAt || ""
            });
        }
    }, [order]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.startsWith("products")) {
            const [, index, field] = name.match(/\[(\d+)\]\.(.*)/) || [];
            if (index && field) {
                setFormData((prev) => {
                    const updatedProducts = [...prev.products];
                    updatedProducts[Number(index)] = {
                        ...updatedProducts[Number(index)],
                        [field]: field === "price" || field === "quantity" ? parseFloat(value) || 0 : value,
                    };
                    return { ...prev, products: updatedProducts };
                });
            }
        } else {
            setFormData((prev) => {
                const keys = name.split(".");
                if (keys.length === 2) {
                    const [parent, child] = keys;
                    return { ...prev, [parent]: { ...(prev as any)[parent], [child]: value } };
                }
                return { ...prev, [name]: value };
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!order?._id) {
            toast.error("Invalid order selected", { position: "top-right", autoClose: 3000 });
            return;
        }
        try {
            await dispatch(updateOrderAsync({ orderId: order._id, payload: formData }) as any);
            onClose();
            toast.success("Order updated successfully!");
        } catch (error: any) {
            toast.error(error || "Failed to update order", { position: "top-right", autoClose: 3000 });
        }
    };

    if (!order) return <div className="p-4 text-center">No order selected</div>;

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full lg:max-w-4xl max-h-full overflow-y-auto no-scrollbar rounded-xl bg-white p-4 lg:p-10 flex flex-col dark:text-white dark:bg-zinc-900 mx-auto"
        >
            {/* --- Order Header --- */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <span className="text-xl lg:text-2xl font-bold text-center md:text-left mb-4 md:mb-0">
                    Purchase Order
                </span>
                <div className="text-right flex flex-col w-full md:w-auto">
                    <span className="text-xs font-semibold">PO Number</span>
                    <input
                        type="text"
                        name="orderNumber"
                        value={formData.orderNumber}
                        onChange={handleInputChange}
                        className="text-blue-600 underline text-lg font-semibold font-mono mb-2 text-end"
                    />

                    <span className="text-xs font-semibold mt-2">
                        Order Creation Date:
                        <input
                            type="date"
                            name="orderDate"
                            value={formData.orderDate?.split('T')[0]}
                            onChange={handleInputChange}
                            className="font-bold max-w-fit text-end border rounded px-2 py-1 dark:bg-zinc-800 dark:text-white mt-1"
                        />
                    </span>
                    <span className="text-xs font-semibold mt-2">
                        Estimated Dispatch Date:
                        <input
                            type="date"
                            name="estimatedDispatchDate"
                            value={formData.estimatedDispatchDate?.split('T')[0]}
                            onChange={handleInputChange}
                            className="font-bold max-w-fit text-end border rounded px-2 py-1 dark:bg-zinc-800 dark:text-white mt-1"
                        />
                    </span>
                    <span className="text-xs my-2">
                        <span
                            className={`font-semibold rounded-full px-2 py-1 text-xs text-white uppercase ${formData.status === "completed"
                                ? "bg-green-500"
                                : formData.status === "pending"
                                    ? "bg-yellow-500"
                                    : formData.status === "delayed"
                                        ? "bg-orange-500"
                                        : formData.status === "rejected"
                                            ? "bg-red-500"
                                            : "bg-gray-500"
                                }`}
                        >
                            {formData.status}
                        </span>
                    </span>
                </div>
            </div>

            {/* --- Generated By & Order Through --- */}
            <div className="flex flex-col lg:flex-row justify-between mt-4 gap-4">
                <div className="flex flex-col text-sm text-left px-2 py-4 border rounded-md dark:bg-zinc-800 lg:w-1/2">
                    <span className="font-mono font-semibold text-lg mb-2">Generated By</span>
                    <img
                        src="/images/user-pic.png"
                        className="w-10 bg-gray-100 dark:bg-zinc-900 rounded-full mb-2"
                        alt="Generated By"
                    />
                    <span className="mb-1">
                        Employee Name: <span className="font-semibold">{formData.generatedBy?.username || "N/A"}</span>
                    </span>
                    <span className="mb-1">
                        Employee Id: <span className="font-semibold text-blue-500 underline">{formData.generatedBy?.employeeId || "N/A"}</span>
                    </span>
                    <span>Designation: <span className="font-semibold">N/A</span></span>
                </div>

                <div className="flex flex-col text-sm text-left px-2 py-4 border rounded-md dark:bg-zinc-800 lg:w-1/2">
                    <span className="font-mono font-semibold text-lg mb-2">Order Through</span>
                    <img
                        src="/images/user-pic.png"
                        className="w-10 bg-gray-100 dark:bg-zinc-900 rounded-full mb-2"
                        alt="Order Through"
                    />
                    <span className="mb-1">
                        Employee Name: <span className="font-semibold">{formData.orderThrough?.username || "N/A"}</span>
                    </span>
                    <span className="mb-1">
                        Employee Id: <span className="font-semibold text-blue-500 underline">{formData.orderThrough?.employeeId || "N/A"}</span>
                    </span>
                    <span>Designation: <span className="font-semibold">N/A</span></span>
                </div>
            </div>

            {/* --- Company Details --- */}
            <div className="bg-gray-100 dark:bg-zinc-800 text-left px-2 py-4 text-sm mt-6 rounded-md">
                <span className="font-mono font-semibold text-lg mb-4 block">Company Details</span>
                <div className="flex flex-col  lg:flex-row justify-between gap-4">
                    <div className="flex flex-col w-full lg:w-1/2">
                        <label className="flex flex-col mb-2">
                            Client Name:
                            <input
                                name="clientName"
                                value={formData.clientName}
                                onChange={handleInputChange}
                                className="font-semibold border rounded px-2 py-1 dark:bg-zinc-800 dark:text-white mt-1 w-full"
                            />
                        </label>
                        <label className="flex flex-col mb-2">
                            Company Name:
                            <input
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleInputChange}
                                className="font-semibold border rounded px-2 py-1 dark:bg-zinc-800 dark:text-white mt-1 w-full"
                            />
                        </label>
                        <label className="flex flex-col mb-2">
                            Address:
                            <input
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="font-semibold border rounded px-2 py-1 break-words dark:bg-zinc-800 dark:text-white mt-1 w-full"
                            />
                        </label>
                    </div>
                    <div className="flex flex-col w-full lg:w-1/2">
                        <label className="flex flex-col mb-2">
                            Zipcode:
                            <input
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleInputChange}
                                className="font-semibold border rounded px-2 py-1 dark:bg-zinc-800 dark:text-white mt-1 w-full"
                            />
                        </label>
                        <label className="flex flex-col mb-2">
                            Contact No.:
                            <input
                                name="contact"
                                value={formData.contact}
                                onChange={handleInputChange}
                                className="font-semibold border rounded px-2 py-1 dark:bg-zinc-800 dark:text-white mt-1 w-full"
                            />
                        </label>
                        <label className="flex flex-col mb-2">
                            GST No.:
                            <input
                                name="gstNumber"
                                value={formData.gstNumber}
                                onChange={handleInputChange}
                                className="font-semibold border rounded px-2 py-1 dark:bg-zinc-800 dark:text-white mt-1 w-full"
                            />
                        </label>
                    </div>
                </div>
            </div>

            {/* --- Add Product Button --- */}
            <div className="flex justify-end mb-2 mt-4">
                <button
                    type="button"
                    onClick={() => setShowAddProduct((prev) => !prev)}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded text-sm"
                >
                    {showAddProduct ? "Cancel Add Product" : "Add Product"}
                </button>
            </div>

            {/* --- Products Table --- */}
            <div className="overflow-x-auto w-full mt-2">
                <table className="table-auto w-full text-left border-collapse text-sm">
                    <thead className="bg-gray-100 dark:bg-zinc-950">
                        <tr>
                            <th className="px-4 py-2 border">Product Name</th>
                            <th className="px-4 py-2 border">Price</th>
                            <th className="px-4 py-2 border">Qty</th>
                            <th className="px-4 py-2 border">Remark</th>
                            <th className="px-4 py-2 border text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {formData.products.map((product, index) => (
                            <tr key={product._id || index} className="hover:bg-gray-50 dark:hover:bg-zinc-950">
                                <td className="px-4 py-2 border">
                                    <textarea
                                        name={`products[${index}].name`}
                                        value={product.name || ""}
                                        onChange={handleInputChange}
                                        className="w-full bg-transparent dark:text-white"
                                    />
                                </td>
                                <td className="px-4 py-2 border">
                                    <input
                                        type="number"
                                        name={`products[${index}].price`}
                                        value={product.price || 0}
                                        onChange={handleInputChange}
                                        className="w-full bg-transparent dark:text-white"
                                    />
                                </td>
                                <td className="px-4 py-2 border">
                                    <input
                                        type="number"
                                        name={`products[${index}].quantity`}
                                        value={product.quantity || 0}
                                        onChange={handleInputChange}
                                        className="w-full bg-transparent dark:text-white"
                                    />
                                </td>
                                <td className="px-4 py-2 border">
                                    <textarea
                                        name={`products[${index}].remark`}
                                        value={product.remark || ""}
                                        onChange={handleInputChange}
                                        className="w-full bg-transparent dark:text-white"
                                    />
                                </td>
                                <td className="px-4 py-2 border text-center">
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteProduct(product._id!, index, product.name)}
                                        className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {/* Add Product Row */}
                        {showAddProduct && (
                            <tr className="bg-gray-50 dark:bg-zinc-950">
                                <td className="px-4 py-2 border">
                                    <input
                                        type="text"
                                        placeholder="New Product Name"
                                        value={newProduct.name}
                                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                        className="w-full bg-transparent dark:text-white"
                                    />
                                </td>
                                <td className="px-4 py-2 border">
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={newProduct.price}
                                        onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                                        className="w-full bg-transparent dark:text-white"
                                    />
                                </td>
                                <td className="px-4 py-2 border">
                                    <input
                                        type="number"
                                        placeholder="Qty"
                                        value={newProduct.quantity}
                                        onChange={(e) => setNewProduct({ ...newProduct, quantity: Number(e.target.value) })}
                                        className="w-full bg-transparent dark:text-white"
                                    />
                                </td>
                                <td className="px-4 py-2 border">
                                    <input
                                        type="text"
                                        placeholder="Remark"
                                        value={newProduct.remark || ""}
                                        onChange={(e) => setNewProduct({ ...newProduct, remark: e.target.value })}
                                        className="w-full bg-transparent dark:text-white"
                                    />
                                </td>
                                <td className="px-4 py-2 border text-center">
                                    <button
                                        type="button"
                                        onClick={handleAddProduct}
                                        className="bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded"
                                    >
                                        Add
                                    </button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- Form Actions --- */}
            <div className="mt-6 flex justify-end space-x-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline dark:bg-zinc-600 dark:hover:bg-zinc-500 dark:text-white"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Save Changes
                </button>
            </div>
        </form>
    );
};

export default UserEditPO;
