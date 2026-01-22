export default function LoadingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-gray-600">Carregando...</p>
    </div>
  );
}
