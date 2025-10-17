import { Menu } from "lucide-react";
import UserAccountStatus from "./UserAccountStatus";
import LanguageSelector from "./LanguageSelector";
import MessageDropdown from "./MessageDropdown";
import NotificationDropdown from "./NotificationDropdown";
import Logo from "./Logo";
import Navigation from "./Navigation";
import LoginButton from "./LoginButton";
import RegisterButton from "./RegisterButton";
import { useAuth } from "../../contexts/AuthContext";

export default function Header() {
  const { isLoggedIn } = useAuth();
  return (
    <header className="sticky top-0 z-50 bg-white text-gray-900 shadow-sm">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Center: Nav (desktop) */}
          <Navigation />

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <LanguageSelector />

            {/* Message Dropdown */}
            <MessageDropdown />

            {/* Notification Dropdown */}
            <NotificationDropdown />

            {/* Mobile hamburger */}
            <button className="rounded-md p-2 hover:bg-gray-100 md:hidden" aria-label="Mở menu">
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* login & register or user info */}
          {isLoggedIn ? (
            <UserAccountStatus />
          ) : (
            <>
              <LoginButton />
              <RegisterButton />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
