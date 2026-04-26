"use client";

import { ActivityLog } from "@/components/activity-log";
import Field from "@/components/Field";
import FieldPassword from "@/components/FieldPassword";
import { ProfileStore } from "@/components/ProfileStore";
import ToastFrame from "@/components/ToastFrame";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { useState } from "react";

export default function ProfilePage() {
  const { name, email, opd, role, updateProfile, addLog } = ProfileStore();
  
  const [formData, setFormData] = useState({ name, email, opd, role, password: "", confirmPassword: "" });

  const [triggerToast, setTriggerToast] = useState(false);
  const [isSuccess, setIsSuccess] = useState(true);

  const handleSave = () => {
  // Update profil
  updateProfile({ name: formData.name, email: formData.email });

  // Tambahkan ke log
  const now = new Date();
    addLog({
      title: "Profile Updated",
      desc: "Updated by User",
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: now.toLocaleDateString(),
    });

    // alert("Profil berhasil diperbarui!");
    setTriggerToast(false); // Reset dulu
    setIsSuccess(true);     // Set status sukses
    setTimeout(() => setTriggerToast(true), 10); // Jalankan toast
  };

  const handleCancel = () => {
    setFormData({ name, email, opd, role, password: "", confirmPassword: "" });

    setTriggerToast(false); // Reset dulu
    setIsSuccess(false);    // Set status error/cancel
    setTimeout(() => setTriggerToast(true), 10); // Jalankan toast
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Account Information</h1>
      
      <div className="bg-white p-10 rounded-lg border border-gray-200 grid grid-cols-12 gap-12">
        
        {/* Kolom Kiri */}
        <div className="col-span-6 flex flex-col gap-10">
          <UserAvatar/>

          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-[11px] uppercase text-gray-400 tracking-wider">
              User Activity Log
            </h3>
            <div className="h-[2px] w-full bg-[#1D2F58] mb-6"></div>
            <ActivityLog />
          </div>
        </div>

        {/* Kolom Kanan: Form */}
        <div className="col-span-6">
          <div className="max-w-xl space-y-6"> 
            <Field 
              title="Full Name" 
              placeholder="Jodi Darmawan"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            <Field 
              title="Email" 
              placeholder="jodi.d@siap.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <Field 
              title="OPD" 
              placeholder="Dinas Komunikasi dan Informatika"
              value={formData.opd}
              onChange={(e) => setFormData({...formData, opd: e.target.value})}
            />
            
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#546064] uppercase">Assigned Role</label>
              <select 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="border border-[#D2D2D2] rounded-lg px-4 py-3 text-xs w-full bg-white focus:outline-none"
              >
                <option value="Admin">Admin</option>
                <option value="OPD">OPD</option>
              </select>
            </div>
            
            <FieldPassword 
              title="New Password" 
              placeholder="••••••••" 
              setIcon={false}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <FieldPassword 
              title="Confirm Your New Password" 
              placeholder="••••••••" 
              setIcon={false}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            />
            
            <div className="flex gap-4 pt-4 justify-end">
              <>
                <Button 
                  variant="secondary" 
                  size="lg"
                  className="w-32"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </>
              <>
                <Button 
                  size="lg" 
                  className="w-32 bg-[#1D2F58] hover:bg-[#041942]" 
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
                {triggerToast && (
                  <ToastFrame 
                    isSuccess={isSuccess} 
                    id="Budi P-0012" 
                    process={isSuccess ? "updated" : undefined} 
                  />
                )}
              </>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}