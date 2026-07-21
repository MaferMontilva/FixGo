import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "../router/AppRouter";

export function AppProviders() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}
