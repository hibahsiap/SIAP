"use client"

import React, { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Pencil, Trash2 } from "lucide-react"
import UserModals from "@/components/UserModal"
import DeleteModal from "@/components/DeleteModal"
import TableTemplate, { ColumnDefinition } from "@/components/TableTemplate"
import EmptyState from "@/components/EmptyState"
import SearchEmptyState from "@/components/SearchEmpty"
import { useUserStore, User } from "@/store/useUserStore"
import { toast } from "sonner"
import { Pagination } from "@/components/Paginations"

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export default function UserManagementPage() {
  const {
    users, isLoading, fetchUsers, deleteUser,
    openEditModal, openAddModal,
    isDeleteModalOpen, closeDeleteModal, selectedUser, openDeleteModal,
  } = useUserStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery, users])

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleDelete = async () => {
    if (!selectedUser) return
    try {
      await deleteUser(selectedUser.id)
      toast.success("User deleted successfully")
    } catch {
      toast.error("Failed to delete user")
    } finally {
      closeDeleteModal()
    }
  }

  const columns: ColumnDefinition[] = useMemo(() => [
    {
      header: "NAME",
      key: "name",
      className: "text-center pl-8 w-[350px]",
      cell: (_, row) => (
        <div className="flex items-center gap-4 py-2">
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-600 font-bold border border-gray-200">
            {getInitials(row.name)}
          </div>
          <span className="font-bold text-gray-800 text-left">{row.name}</span>
        </div>
      ),
    },
    {
      header: "OPD",
      key: "nameOPD",
      className: "text-center",
      cell: (val) => <div className="text-gray-500 font-medium">{val}</div>,
    },
    {
      header: "EMAIL",
      key: "email",
      className: "text-center",
      cell: (val) => <div className="text-gray-500 font-medium lowercase">{val}</div>,
    },
    {
      header: "PHONE NUMBER",
      key: "phone",
      className: "text-center",
      cell: (val) => <div className="text-gray-500 font-medium">{val ?? "—"}</div>,
    },
    {
      header: "ROLE",
      key: "role",
      className: "text-center",
      cell: (val) => (
        <div className="flex justify-center">
          <span className="px-5 py-1.5 bg-[#f8f9fa] border border-gray-200 text-[#21335A] rounded-md text-[11px] font-bold tracking-widest uppercase">
            {val}
          </span>
        </div>
      ),
    },
    {
      header: "ACTIONS",
      key: "actions",
      className: "text-right pr-8 w-[150px]",
      cell: (_, row) => (
        <div className="flex justify-end gap-2 text-gray-400">
          <button onClick={() => openEditModal(row as User)} className="p-2 hover:bg-gray-100 rounded-md hover:text-[#14234b] transition-all">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => openDeleteModal(row as User)} className="p-2 hover:bg-red-50 rounded-md hover:text-red-600 transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ], [openEditModal, openDeleteModal])

  return (
    <div className="p-4 bg-gray-50/50 min-h-screen">

      {/* BAGIAN HEADER */}
      <div className="bg-white px-4 py-6 rounded-t-lg border border-gray-200 border-b-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-[#14234b]">User Management</h2>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full md:w-[280px] bg-gray-100 border-transparent focus:bg-white focus:border-[#1D2F58] rounded-md h-10 text-sm transition-all"
            />
          </div>
          <Button onClick={openAddModal} className="bg-[#1a233a] hover:bg-[#1a233a]/90 text-white font-medium h-10 px-4 rounded-md flex items-center gap-2">
            <Plus className="w-4 h-4" /> ADD NEW USER
          </Button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 border-t-0 rounded-b-lg flex flex-col shadow-sm min-h-[calc(100vh-160px)]">
        <div className="flex-1 overflow-auto flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
          ) : filteredUsers.length > 0 ? (
            <TableTemplate columns={columns} data={paginatedUsers as any} />
          ) : searchQuery !== "" ? (
            <SearchEmptyState type="user" searchQuery={searchQuery} />
          ) : (
            <EmptyState
              title="No users found"
              description={<>There is currently no data available. <br /> Please add new data to see it displayed here.</>}
              actionButton={
                <Button onClick={openAddModal} className="bg-[#172033] hover:bg-[#172033]/90 text-white font-medium px-5 py-5 flex items-center gap-2 rounded-md">
                  <Plus className="w-4 h-4" /> NEW USER
                </Button>
              }
            />
          )}
        </div>

        {/* Pagination */}
        <div className="mt-auto">
          <Pagination
            totalItems={filteredUsers.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />

        </div>
      </div>

      <UserModals />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        itemName="user account"
      />
    </div>
  )
}
