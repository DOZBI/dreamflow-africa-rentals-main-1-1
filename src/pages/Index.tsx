import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PropertyCard from "@/components/PropertyCard";
import SearchFilters from "@/components/SearchFilters";

const Index = () => {
  // Sample properties data
  const properties = [
    {
      id: "1",
      title: "Appartement moderne à Poto-Poto",
      location: "Poto-Poto, Brazzaville",
      price: 150000,
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      bedrooms: 2,
      bathrooms: 1,
      area: 65,
      rating: 4.8,
      reviews: 24,
      isNew: true
    },
    {
      id: "2", 
      title: "Villa avec piscine - Mpila",
      location: "Mpila, Pointe-Noire",
      price: 400000,
      image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      bedrooms: 4,
      bathrooms: 3,
      area: 180,
      rating: 4.9,
      reviews: 12,
      isFeatured: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <SearchFilters />
          </div>
          
          {/* Properties Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Logements disponibles
              </h2>
              <p className="text-muted-foreground">
                {properties.length} propriétés trouvées
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} {...property} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
