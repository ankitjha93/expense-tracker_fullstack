import styled from "styled-components";
import { MainLayout } from "./styles/Layouts";
import Orb from "./Components/Orb/Orb";
import Navigation from "./Components/Navigation/Navigation";
import { useMemo, useState } from "react";
import Dashboard from "./Components/Dashboard/Dashboard";
import Income from "./Components/Income/Income";
import Expenses from "./Components/Expenses/Expenses";
import TransactionsView from "./Components/Transactions/TransactionsView";
import BudgetsView from "./Components/Budgets/BudgetsView";
import AdvisorView from "./Components/Advisor/AdvisorView";
import AuthModal from "./Components/Auth/AuthModal";
import { useAuth } from "./context/authContext";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [active, setActive] = useState(1);
  const { user, loading } = useAuth();

  const displayData = () => {
    switch (active) {
      case 1:
        return <Dashboard setActive={setActive} />;
      case 2:
        return <TransactionsView setActive={setActive} />;
      case 3:
        return <Income setActive={setActive} />;
      case 4:
        return <Expenses setActive={setActive} />;
      case 5:
        return <BudgetsView setActive={setActive} />;
      case 6:
        return <AdvisorView setActive={setActive} />;
      default:
        return <Dashboard setActive={setActive} />;
    }
  };

  const orbMemo = useMemo(() => {
    return <Orb />;
  }, []);

  return (
    <AppStyled className="App">
      {orbMemo}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="app-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="loader-con"
          >
            <div className="loader"></div>
          </motion.div>
        ) : !user ? (
          <motion.div
            key="app-auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', height: '100%', position: 'relative', zIndex: 10 }}
          >
            <AuthModal />
          </motion.div>
        ) : (
          <motion.div
            key="app-main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', height: '100%', position: 'relative', zIndex: 10 }}
          >
            <MainLayout>
              <Navigation active={active} setActive={setActive} />
              <main>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    style={{ height: '100%' }}
                  >
                    {displayData()}
                  </motion.div>
                </AnimatePresence>
              </main>
            </MainLayout>
          </motion.div>
        )}
      </AnimatePresence>
    </AppStyled>
  );
}

const AppStyled = styled.div`
  height: 100vh;
  height: 100dvh;
  background-color: var(--bg-body);
  background-image: 
    radial-gradient(at 10% 20%, rgba(99, 102, 241, 0.08) 0px, transparent 50%),
    radial-gradient(at 90% 80%, rgba(16, 185, 129, 0.06) 0px, transparent 50%);
  position: relative;
  overflow: hidden;

  .loader-con {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;

    .loader {
      width: 48px;
      height: 48px;
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top-color: var(--accent-violet);
      border-radius: 50%;
      animation: spin 0.8s infinite linear;
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  }

  main {
    flex: 1;
    background: rgba(14, 19, 31, 0.75);
    border: 1px solid var(--border-subtle);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-radius: 28px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);

    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;

    @media (max-width: 1024px) {
      border-radius: 20px;
    }

    @media (max-width: 640px) {
      border-radius: 16px;
    }
  }
`;

export default App;
