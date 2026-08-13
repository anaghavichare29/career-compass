import Login from "../pages/login";
import Register from "../pages/register";
import IndustryExperts from "../pages/industry-experts";

function App() {
  const path = window.location.pathname;

  if (path === "/register") {
    return <Register />;
  }

  if (path === "/industry-experts") {
    return <IndustryExperts />;
  }

  return <Login />;
}

export default App;