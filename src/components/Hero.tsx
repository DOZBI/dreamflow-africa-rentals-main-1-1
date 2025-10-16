
import { Button } from "@/components/ui/button";
import { Search, Play, Plus, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background with Dreamflow gradient */}
      <div className="absolute inset-0 gradient-hero-dreamflow opacity-90"></div>
      
      {/* Floating elements inspired by Dreamflow */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl float-animation"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl float-animation" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-purple-400/15 rounded-full blur-lg float-animation" style={{ animationDelay: '4s' }}></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Dreamflow Marketplace</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
            Trouvez votre
            <span className="block text-gradient bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              logement idéal
            </span>
            en Afrique
          </h1>
          
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            La première plateforme de location immobilière pensée pour l'Afrique. 
            Découvrez des propriétés exceptionnelles avec une expérience moderne et fluide.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="px-8 py-4 text-lg font-semibold bg-white text-purple-700 hover:bg-white/90 shadow-dreamflow rounded-2xl"
            >
              <Search className="mr-2 h-5 w-5" />
              Commencer ma recherche
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-4 text-lg font-semibold border-white/30 text-white hover:bg-white/10 backdrop-blur-sm rounded-2xl"
              onClick={() => window.location.href = '/feed'}
            >
              <Play className="mr-2 h-5 w-5" />
              Découvrir en vidéo
            </Button>

            <Button 
              variant="secondary" 
              size="lg" 
              className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500 shadow-dreamflow rounded-2xl"
              onClick={() => window.location.href = '/mobile'}
            >
              <Plus className="mr-2 h-5 w-5" />
              Version Mobile
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
