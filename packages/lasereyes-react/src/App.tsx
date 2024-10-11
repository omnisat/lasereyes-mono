import LaserEyesProvider from "../lib/providers/lasereyes-provider";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import UnisatCard from "./unisat-card";

function App() {
  return (
    <LaserEyesProvider>
      <div>
        <UnisatCard />
      </div>
    </LaserEyesProvider>
  );
}

export default App;
