import Login from "../pages/login";
import Register from "../pages/register";
import Student from "../pages/student";

function App() {
  const path = window.location.pathname;

  if (path === "/register") {
    return <Register />;
  }

  if (path === "/student") {
    return <Student />;
  }

  return <Login />;
}

export default App;