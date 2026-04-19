"use client";

import ButtonClick from "@/components/Button";
import Field from "@/components/Field";
import FieldPassword from "@/components/FieldPassword";
import { UserAvatar } from "@/components/user-avatar";
import { ActivityLog } from "@/components/activity-log";

export default function ProfilePage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Account Information</h1>
      
      {/* Container utama */}
      <div className="bg-white p-10 rounded-lg border border-gray-200 grid grid-cols-12 gap-12">
        
        {/* Kolom Kiri: Avatar & Log */}
        <div className="col-span-6 flex flex-col gap-10">
          <UserAvatar src="/logo_siap.png" />  {/* nyoba doan*/}

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
            <Field title="Full Name" placeholder="Jodi Darmawan" />
            <Field title="Email" placeholder="jodi.d@siap.com" />
            <Field title="OPD" placeholder="Dinas Komunikasi dan Informatika" />
            
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#546064] uppercase">Assigned Role</label>
              <select className="border border-[#D2D2D2] rounded-lg px-4 py-3 text-xs w-full bg-white focus:outline-none">
                <option>Admin</option>
                <option>OPD</option>
              </select>
            </div>
            
            <FieldPassword title="New Password" placeholder="••••••••" setIcon={false} />
            <FieldPassword title="Confirm Your New Password" placeholder="••••••••" setIcon={false} />
            
            <div className="flex gap-4 pt-4 justify-end">
              <div className="w-32">
                <ButtonClick name="Cancel" className="!bg-gray-100 !text-gray-600 hover:!bg-gray-200" />
              </div>
              <div className="w-32">
                <ButtonClick name="Save Changes" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}