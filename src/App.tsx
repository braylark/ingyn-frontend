import { useState } from "react";
import LoginPage from "./components/LoginPage";
import CreateAmbassador from "./components/CreateAmbassador";
import Dashboard from "./components/Dashboard";
import ContentGenerator from "./components/ContentGenerator";
import ContentCreationHub from "./components/ContentCreationHub";
import Scheduler from "./components/Scheduler";
import Analytics from "./components/Analytics";
import Engagement from "./components/Engagement";
import Marketplace from "./components/Marketplace";
import Navigation from "./components/Navigation";

type AppState = "login" | "create-ambassador" | "dashboard";
type DashboardPage = "home" | "create" | "scheduler" | "analytics" | "engagement" | "marketplace";

export default function App() {
  const [appState, setAppState] = useState<AppState>("login");
  const [currentPage, setCurrentPage] = useState<DashboardPage>("home");
  const [hasAccount, setHasAccount] = useState(false);

  const handleLogin = () => {
    setAppState("create-ambassador");
  };

  const handleAmbassadorComplete = () => {
    setAppState("dashboard");
    setCurrentPage("home");
  };

  const handleAmbassadorBack = () => {
    setAppState("login");
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as DashboardPage);
  };

  const handleAccountCreated = () => {
    setHasAccount(true);
  };

  // Onboarding Flow
  if (appState === "login") {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (appState === "create-ambassador") {
    return (
      <CreateAmbassador
        onComplete={handleAmbassadorComplete}
        onBack={handleAmbassadorBack}
      />
    );
  }

  // Main Dashboard
  return (
    <div className="min-h-screen bg-[#F5F6FA] flex">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      
      <main className="flex-1 p-6 pb-24 lg:pb-6 lg:ml-64 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {currentPage === "home" && <Dashboard onNavigate={handleNavigate} />}
          {currentPage === "create" && <ContentCreationHub hasAccount={hasAccount} onAccountCreated={handleAccountCreated} />}
          {currentPage === "scheduler" && <Scheduler />}
          {currentPage === "analytics" && <Analytics />}
          {currentPage === "engagement" && <Engagement />}
          {currentPage === "marketplace" && <Marketplace />}
        </div>
      </main>
    </div>
  );
}
