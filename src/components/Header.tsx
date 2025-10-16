import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, User, Heart } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <span className="text-sm font-bold text-primary-foreground">DF</span>
            </div>
            <span className="text-xl font-display font-bold text-gradient">
              DreamFlow
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-foreground hover:text-primary transition-smooth">
              Accueil
            </a>
            <a href="/feed" className="text-foreground hover:text-primary transition-smooth">
              Feed Vidéo
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-smooth">
              Publier
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-smooth">
              À propos
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <User className="h-5 w-5" />
            </Button>
            <Button className="btn-african">
              Se connecter
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a
                href="/"
                className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary transition-smooth"
              >
                Accueil
              </a>
              <a
                href="/feed"
                className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary transition-smooth"
              >
                Feed Vidéo
              </a>
              <a
                href="#"
                className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary transition-smooth"
              >
                Publier
              </a>
              <a
                href="#"
                className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary transition-smooth"
              >
                À propos
              </a>
              <div className="pt-4 pb-2 border-t">
                <Button className="w-full btn-african">
                  Se connecter
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;