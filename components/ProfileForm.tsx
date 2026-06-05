"use client";

import { ActivityLog } from "@/components/activity-log";
import Field from "@/components/Field";
import FieldPassword from "@/components/FieldPassword";
import { ProfileStore } from "@/components/ProfileStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "@/components/user-avatar";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ProfileForm() {
  const {
    name,
    email,
    phone,
    opd,
    role,
    saving,
    loaded,
    loadProfile,
    loadLogs,
    saveProfile,
  } = ProfileStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    opd: "",
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
    loadLogs();
  }, [loadProfile, loadLogs]);

  useEffect(() => {
    if (loaded) {
      setFormData((prev) => ({
        ...prev,
        name,
        email,
        phone,
        opd,
      }));
    }
  }, [loaded, name, email, phone, opd]);

  const handleSave = async () => {
    setValidationError(null);

    if (formData.password || formData.confirmPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        setValidationError("Current password is required to set a new password");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setValidationError("New password and confirmation do not match");
        return;
      }
      if (formData.password.length < 6) {
        setValidationError("New password must be at least 6 characters");
        return;
      }
    }

    const result = await saveProfile({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      opdName: formData.opd,
      password: formData.password || undefined,
      currentPassword: formData.currentPassword || undefined,
    });

    if (result.ok) {
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        password: "",
        confirmPassword: "",
      }));
      toast.success("Profile updated", {
        description: "Your changes have been saved.",
      });
    } else {
      setValidationError(result.error ?? "Save failed");
      toast.error("Update failed", {
        description: result.error ?? "Please try again.",
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      name,
      email,
      phone,
      opd,
      currentPassword: "",
      password: "",
      confirmPassword: "",
    });
    setValidationError(null);
    toast("Changes discarded");
  };

  return (
    <div className="px-4 py-3 max-w-6xl 2xl:max-w-7xl mx-auto">
      <h1 className="text-3xl 2xl:text-4xl font-bold text-[#041942] mb-6">Account Information</h1>

      <div className="bg-white p-10 rounded-lg border border-gray-200 grid grid-cols-12 gap-12">
        {/* Kolom Kiri */}
        <div className="col-span-6 flex flex-col gap-10">
          <UserAvatar />

          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-[11px] 2xl:text-sm uppercase text-gray-400 tracking-wider">
              User Activity Log
            </h3>
            <div className="h-[2px] w-full bg-[#1D2F58] mb-6"></div>
            <ScrollArea className="h-[480px] 2xl:h-[500px] pr-3 [&_[data-slot=scroll-area-thumb]]:bg-[#1D2F58]/40 hover:[&_[data-slot=scroll-area-thumb]]:bg-[#1D2F58]/70">
              <ActivityLog />
            </ScrollArea>
          </div>
        </div>

        {/* Kolom Kanan: Form */}
        <div className="col-span-6">
          <div className="max-w-xl space-y-4 [&_h1]:text-[13px] [&_label]:text-[13px] [&_input]:text-sm [&_input]:py-3.5 2xl:[&_h1]:text-[15px] 2xl:[&_label]:text-[15px] 2xl:[&_input]:text-base 2xl:[&_input]:py-4">
            <Field
              title="Full Name"
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Field
              title="Email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Field
              title="Phone"
              placeholder="08xx-xxxx-xxxx"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Field
              title="OPD"
              placeholder="Dinas Komunikasi dan Informatika"
              value={formData.opd}
              onChange={(e) => setFormData({ ...formData, opd: e.target.value })}
            />

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#546064] uppercase">
                Assigned Role
              </label>
              <input
                value={role}
                disabled
                className="border border-[#D2D2D2] rounded-lg px-4 py-3 text-xs w-full bg-gray-50 text-gray-500 capitalize"
              />
            </div>

            <FieldPassword
              title="Current Password"
              placeholder="Required to change password"
              setIcon={false}
              value={formData.currentPassword}
              onChange={(e) =>
                setFormData({ ...formData, currentPassword: e.target.value })
              }
            />
            <FieldPassword
              title="New Password"
              placeholder="••••••••"
              setIcon={false}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <FieldPassword
              title="Confirm Your New Password"
              placeholder="••••••••"
              setIcon={false}
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
            />

            {validationError && (
              <p className="text-red-500 text-xs">{validationError}</p>
            )}

            <div className="flex gap-4 pt-4 justify-end">
              <Button
                variant="secondary"
                size="lg"
                className="w-32 h-10 2xl:w-40 2xl:h-12 2xl:font-semibold"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                size="lg"
                className="w-32 h-10 2xl:w-40 2xl:h-12 2xl:font-semibold bg-[#1D2F58] hover:bg-[#041942]"
                onClick={handleSave}
                disabled={saving || !loaded}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
