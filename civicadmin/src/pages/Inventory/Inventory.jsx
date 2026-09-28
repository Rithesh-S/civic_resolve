// src/pages/Inventory/Inventory.jsx
import React, { useState, useEffect } from "react";
import { getInventory, createInventoryItem } from "../../services/api";
import InventoryTable from "../../components/inventory/InventoryTable";
import InventoryFilters from "../../components/inventory/InventoryFilters";
import AddInventoryModal from "../../components/inventory/AddInventoryModal";
import ReportGenerator from "../../components/inventory/ReportGenerator";
import {
  PlusIcon,
  DocumentChartBarIcon,
  CubeIcon,
  CurrencyRupeeIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import ExpenseApprovals from "../../components/inventory/InventoryRequests";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("items");
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: "all",
    status: "all",
    search: "",
    sortBy: "name",
    sortOrder: "asc",
  });

  // Dummy inventory requests data for now
  const [inventoryRequests] = useState([
    {
      _id: "req1",
      status: "requested",
      officerId: "user2",
      requestedAt: new Date().toISOString(),
      items: [
        {
          inventoryId: "item1",
          name: "Electrical Wires",
          quantity: 5,
          unitCost: 150,
          totalCost: 750,
        },
      ],
    },
    {
      _id: "req2",
      status: "approved",
      officerId: "user3",
      requestedAt: new Date(Date.now() - 86400000).toISOString(),
      approvedAt: new Date(Date.now() - 43200000).toISOString(),
      items: [
        {
          inventoryId: "item2",
          name: "Cement Bags",
          quantity: 10,
          unitCost: 400,
          totalCost: 4000,
        },
      ],
    },
  ]);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      const inventoryResponse = await getInventory(1, 100);

      // Handle the API response structure
      setInventory(inventoryResponse.inventory || []);
      setFilteredInventory(inventoryResponse.inventory || []);
    } catch (err) {
      setError(err.message || "Failed to fetch inventory data");
      console.error("Error fetching inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters whenever inventory or filters change
  useEffect(() => {
    let filtered = [...inventory];

    // Apply category filter
    if (filters.category !== "all") {
      filtered = filtered.filter((item) => item.category === filters.category);
    }

    // Apply status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((item) => {
        const stockStatus = getStockStatus(item.availableCount);
        return stockStatus.toLowerCase() === filters.status;
      });
    }

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm) ||
          (item.description &&
            item.description.toLowerCase().includes(searchTerm)) ||
          item.category.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[filters.sortBy];
      let bValue = b[filters.sortBy];

      if (filters.sortBy === "totalValue") {
        aValue = a.availableCount * a.unitCost;
        bValue = b.availableCount * b.unitCost;
      } else if (filters.sortBy === "name" || filters.sortBy === "category") {
        aValue = aValue ? aValue.toLowerCase() : "";
        bValue = bValue ? bValue.toLowerCase() : "";
      }

      if (filters.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredInventory(filtered);
  }, [inventory, filters]);

  const getStockStatus = (availableCount) => {
    if (availableCount === 0) return "Out of Stock";
    if (availableCount <= 10) return "Low Stock";
    return "In Stock";
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleInventoryUpdate = (newItem) => {
    setInventory((prev) => [...prev, newItem]);
    setFilteredInventory((prev) => [...prev, newItem]);
  };

  // In your Inventory.jsx component, update the handleAddItem function:
  const handleAddItem = async (formData) => {
    try {
      const createdItem = await createInventoryItem(formData);
      setInventory((prev) => [...prev, createdItem]);
      setFilteredInventory((prev) => [...prev, createdItem]);
      alert(
        `${formData.get("name")} has been successfully added to inventory.`
      );
      return true;
    } catch (error) {
      console.error("Error creating inventory item:", error);
      alert("Failed to add inventory item. Please try again.");
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📦</div>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
            Loading inventory...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
            {error}
          </h2>
          <button
            onClick={fetchInventoryData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const pendingRequests = inventoryRequests.filter(
    (req) => req.status === "requested"
  );

  // Calculate inventory statistics
  const totalItems = inventory.length;
  const totalValue = inventory.reduce(
    (sum, item) => sum + (item.availableCount || 0) * (item.unitCost || 0),
    0
  );
  const lowStockItems = inventory.filter(
    (item) => (item.availableCount || 0) <= 10 && (item.availableCount || 0) > 0
  ).length;
  const outOfStockItems = inventory.filter(
    (item) => (item.availableCount || 0) === 0
  ).length;

  // Calculate expenses from approved requests
  const approvedRequests = inventoryRequests.filter(
    (req) => req.status === "approved"
  );
  const totalExpenses = approvedRequests.reduce(
    (sum, req) =>
      sum +
      req.items.reduce((itemSum, item) => itemSum + (item.totalCost || 0), 0),
    0
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Inventory Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your organization's inventory and track resource allocation
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="inline-flex items-center px-5 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-purple-500/50 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <DocumentChartBarIcon className="w-5 h-5 mr-2" />
            Generate Report
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-5 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add New Item
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Items
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {totalItems}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <CubeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Value
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(totalValue)}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <CurrencyRupeeIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Low Stock
              </p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {lowStockItems}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Out of Stock
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {outOfStockItems}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <XMarkIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">
                Total Expenses
              </p>
              <p className="text-2xl font-bold">
                {formatCurrency(totalExpenses)}
              </p>
              <p className="text-sm text-blue-100 mt-1">
                From approved requests
              </p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <ChartBarIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100">
                Pending Requests
              </p>
              <p className="text-2xl font-bold">{pendingRequests.length}</p>
              <p className="text-sm text-green-100 mt-1">Awaiting approval</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <DocumentChartBarIcon className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("items")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === "items"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <div className="flex items-center">
                <CubeIcon className="w-5 h-5 mr-2" />
                Inventory Items
                {filteredInventory.length !== totalItems && (
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-200">
                    {filteredInventory.length} of {totalItems}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === "requests"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <div className="flex items-center">
                <DocumentChartBarIcon className="w-5 h-5 mr-2" />
                Requests & Approvals
                {pendingRequests.length > 0 && (
                  <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-200 animate-pulse">
                    {pendingRequests.length} pending
                  </span>
                )}
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "items" && (
            <div className="space-y-6">
              {/* Filters */}
              <InventoryFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                inventory={inventory}
              />

              {/* Inventory Table */}
              <InventoryTable inventory={filteredInventory} />
            </div>
          )}

          {activeTab === "requests" && (
            <>
              {/* <InventoryApprovals onRequestsUpdate={fetchInventoryData} /> */}
              <ExpenseApprovals />
            </>
          )}
        </div>
      </div>

      {/* Add Inventory Modal */}
      <AddInventoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddItem={handleAddItem}
      />

      {/* Report Generator Modal */}
      <ReportGenerator
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        inventory={inventory}
        inventoryRequests={inventoryRequests}
        totalExpenses={totalExpenses}
      />
    </div>
  );
};

export default Inventory;
