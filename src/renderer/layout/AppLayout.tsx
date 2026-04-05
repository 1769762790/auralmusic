import Header from "@/components/Header";
import MainContent from "./MainContent";

export const AppShell = () => {
  return (
    <main className="w-full h-full">
      <Header/>
      <MainContent />
    </main>
  );
}
