const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#08091b]">
      <iframe
        title="ALET India CMS and lead dashboard"
        src={`${basePath}/cms-admin.html`}
        className="min-h-screen w-full border-0"
      />
    </main>
  );
}
