export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#f9f9f9] flex justify-center items-center h-screen">
        <main>{children}</main>
    </div>
  );
}