import Header from "@/components/Header";
import MainContent from "./MainContent";

export const AppShell = () => {
  let a = 1
  return (
    <main className="w-full h-full">
      <Header/>
      <MainContent />
    </main>
  );
}
