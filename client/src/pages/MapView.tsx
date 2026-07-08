import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Search } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
// Map wird später integriert

export default function MapView() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [searchCity, setSearchCity] = useState("");
  const [selectedListing, setSelectedListing] = useState<number | null>(null);

  const { data: listings } = trpc.gartenlauben.list.useQuery({
    city: searchCity,
    maxPrice: 10000,
    maxDistanceToRadweg: 1000,
  });

  const handleSearch = () => {
    // Search is already handled by the query above
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F1E8" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-sm" style={{ backgroundColor: "rgba(245, 241, 232, 0.95)", borderBottom: "1px solid #E8DFD3" }}>
        <div className="container py-6">
          <h1 style={{ color: "#2C2C2C" }} className="text-3xl font-bold mb-4">
            Gartenlauben auf der Karte
          </h1>
          <div className="flex gap-2">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Stadt eingeben..."
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                style={{ backgroundColor: "white", borderColor: "#E8DFD3" }}
              />
              <Button onClick={handleSearch} className="btn-primary flex items-center gap-2">
                <Search className="w-4 h-4" />
                Suchen
              </Button>
            </div>
            <Button onClick={() => navigate("/listings")} className="btn-outline">
              Listenansicht
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-4 gap-6">
          {/* Map Area */}
          <div className="col-span-3">
            <Card className="h-96 overflow-hidden flex items-center justify-center" style={{ backgroundColor: "white", border: "1px solid #E8DFD3" }}>
              <div className="text-center">
                <MapPin className="w-12 h-12 mx-auto mb-2" style={{ color: "#C85A3A" }} />
                <p style={{ color: "#8B8B8B" }}>Google Maps wird hier angezeigt</p>
              </div>
            </Card>
          </div>

          {/* Listings Sidebar */}
          <div className="col-span-1">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {listings && listings.length > 0 ? (
                listings.map((listing: any) => (
                  <Card
                    key={listing.id}
                    className="p-4 cursor-pointer hover:shadow-lg transition-all"
                    style={{
                      backgroundColor: selectedListing === listing.id ? "#F0E8DC" : "white",
                      border: selectedListing === listing.id ? "2px solid #C85A3A" : "1px solid #E8DFD3",
                    }}
                    onClick={() => setSelectedListing(listing.id)}
                  >
                    <div className="h-20 rounded-lg bg-gradient-to-br from-terracotta/20 to-sage/20 flex items-center justify-center mb-2">
                      <MapPin className="w-6 h-6" style={{ color: "#C85A3A" }} />
                    </div>
                    <h3 style={{ color: "#2C2C2C" }} className="font-bold text-sm mb-1">
                      {listing.title}
                    </h3>
                    <p style={{ color: "#8B8B8B" }} className="text-xs mb-2">
                      {listing.city}
                    </p>
                    {listing.distanceToRadweg && (
                      <p style={{ color: "#6B8E7F" }} className="text-xs font-semibold mb-2">
                        <Navigation className="w-3 h-3 inline mr-1" />
                        {listing.distanceToRadweg} km zum Radweg
                      </p>
                    )}
                    <p style={{ color: "#C85A3A" }} className="font-bold text-sm">
                      €{Number(listing.pricePerNight).toFixed(0)}/Nacht
                    </p>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <MapPin className="w-8 h-8 mx-auto mb-2" style={{ color: "#E8DFD3" }} />
                  <p style={{ color: "#8B8B8B" }} className="text-sm">
                    Keine Lauben gefunden
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-3 gap-6">
          <Card className="p-6" style={{ backgroundColor: "white", border: "1px solid #E8DFD3" }}>
            <MapPin className="w-8 h-8 mb-3" style={{ color: "#C85A3A" }} />
            <h3 style={{ color: "#2C2C2C" }} className="font-bold mb-2">
              Nähe zu Radwegen
            </h3>
            <p style={{ color: "#8B8B8B" }} className="text-sm">
              Alle Lauben sind speziell für Radreisende ausgewählt und liegen in der Nähe von Radwegen.
            </p>
          </Card>

          <Card className="p-6" style={{ backgroundColor: "white", border: "1px solid #E8DFD3" }}>
            <Navigation className="w-8 h-8 mb-3" style={{ color: "#6B8E7F" }} />
            <h3 style={{ color: "#2C2C2C" }} className="font-bold mb-2">
              Interaktive Karte
            </h3>
            <p style={{ color: "#8B8B8B" }} className="text-sm">
              Klicken Sie auf die Marker, um mehr Informationen zu den Lauben zu erhalten.
            </p>
          </Card>

          <Card className="p-6" style={{ backgroundColor: "white", border: "1px solid #E8DFD3" }}>
            <Search className="w-8 h-8 mb-3" style={{ color: "#B8860B" }} />
            <h3 style={{ color: "#2C2C2C" }} className="font-bold mb-2">
              Schnelle Suche
            </h3>
            <p style={{ color: "#8B8B8B" }} className="text-sm">
              Suchen Sie nach Stadt oder Region, um Lauben in Ihrer Nähe zu finden.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
