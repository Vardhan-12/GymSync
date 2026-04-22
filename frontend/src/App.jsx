import { useEffect } from "react";
import AppRouter from "./app/AppRouter";
import socket from "./socket";

function App() {

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (userId) {
      socket.emit("userOnline", userId);
    }
  }, []);

  return <AppRouter />;
}

export default App;