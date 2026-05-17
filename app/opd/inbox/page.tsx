"use client";

export default function InboxPage() {

  return (
    <div className="">
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-10">
        <div className="relative w-80 h-48 bg-slate-900 rounded-2xl mb-12 shadow-2xl flex items-center justify-center">
            <div className="w-16 h-4 bg-slate-700 rounded-full animate-pulse mr-20"></div>
            <div className="w-24 h-4 bg-slate-800 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-8 -left-8 w-72 h-44 bg-white border border-gray-100 rounded-2xl shadow-xl p-6 flex flex-col gap-3">
                <div className="h-4 w-32 bg-gray-100 rounded-full"></div>
                <div className="h-4 w-52 bg-gray-50 rounded-full"></div>
                <div className="h-4 w-44 bg-gray-50 rounded-full"></div>
            </div>
        </div>

        <h3 className="text-2xl font-bold text-slate-800">Every message deserves a response</h3>
        <p className="text-gray-400 mt-2 text-center max-w-sm">
          Choose a message from the left menu and start the conversation
        </p>
      </div>

    </div>
  );
}