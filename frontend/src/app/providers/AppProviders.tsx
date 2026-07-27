import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../modules/auth";
import { AppRouter } from "../router/AppRouter";

export function AppProviders() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}
