import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Star, Filter, ChevronLeft } from "lucide-react";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import type { Gartenlaube } from "../../../drizzle/schema";

export default function Listings() {
  const [, navigate] = useLocation();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    city: "",
    minPrice: "",
    maxPrice: "",
    maxDistance: "",
  });

  const { data: listings, isLoading } = trpc.gartenlauben.list.useQuery({
    city: filters.city || undefined,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    maxDistanceToRadweg: filters.maxDistance
      ? Number(filters.maxDistance)
      : undefined,
    limit: 100,
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      city: "",
      minPrice: "",
      maxPrice: "",
      maxDistance: "",
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#F5F1E8]/95 backdrop-blur-sm border-b border-[#E8DFD3]">
        <div className="container py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-terracotta hover:text-terracotta-dark transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Zurück
          </button>
          <h1 className="text-2xl font-bold text-[#2C2C2C]">
            Alle Gartenlauben
          </h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-[#E8DFD3] rounded-lg hover:bg-cream-dark/30 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div
            className={`${
              showFilters ? "block" : "hidden"
            } block col-span-1`}
          >
            <div className="card-organic p-6 rounded-xl sticky top-24">
              <h2 className="text-lg font-bold mb-6 text-[#2C2C2C]">Filter</h2>

              <div className="space-y-6">
                {/* City Filter */}
                <div>
                  <label className="text-sm font-medium text-[#2C2C2C] block mb-2">
                    Stadt
                  </label>
                  <Input
                    placeholder="z.B. Berlin"
                    value={filters.city}
                    onChange={(e) => handleFilterChange("city", e.target.value)}
                    className="bg-[#F5F1E8] border-[#E8DFD3]"
                  />
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium text-[#2C2C2C] block mb-2">
                    Preis pro Nacht
                  </label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) =>
                        handleFilterChange("minPrice", e.target.value)
                      }
                      className="bg-[#F5F1E8] border-[#E8DFD3]"
                    />
                    <span className="text-muted">-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        handleFilterChange("maxPrice", e.target.value)
                      }
                      className="bg-[#F5F1E8] border-[#E8DFD3]"
                    />
                  </div>
                </div>

                {/* Distance to Radweg */}
                <div>
                  <label className="text-sm font-medium text-[#2C2C2C] block mb-2">
                    Max. Entfernung zum Radweg (km)
                  </label>
                  <Input
                    type="number"
                    placeholder="z.B. 5"
                    value={filters.maxDistance}
                    onChange={(e) =>
                      handleFilterChange("maxDistance", e.target.value)
                    }
                    className="bg-[#F5F1E8] border-[#E8DFD3]"
                  />
                </div>

                {/* Reset Button */}
                <Button
                  onClick={handleReset}
                  className="w-full btn-outline text-sm"
                >
                  Filter zurücksetzen
                </Button>
              </div>
            </div>
          </div>

          {/* Listings Grid */}
          <div className="col-span-3">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted">Lädt...</p>
              </div>
            ) : listings && listings.length > 0 ? (
              <div className="grid grid-cols-2 gap-6">
                {listings.map((laube: Gartenlaube) => (
                  <Card
                    key={laube.id}
                    className="card-organic overflow-hidden hover:shadow-lg transition-smooth cursor-pointer group"
                    onClick={() => navigate(`/listings/${laube.id}`)}
                  >
                    {/* Image */}
                    <div className="w-full h-48 bg-gradient-to-br from-terracotta/20 to-sage/20 flex items-center justify-center overflow-hidden relative">
                      <div className="text-center group-hover:scale-110 transition-transform">
                        <MapPin className="w-8 h-8 text-terracotta/50 mx-auto mb-2" />
                        <p className="text-sm text-muted">Foto</p>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="font-bold text-lg mb-2 text-[#2C2C2C] line-clamp-2 group-hover:text-terracotta transition-colors">
                        {laube.title}
                      </h3>

                      <p className="text-sm text-muted mb-4 line-clamp-2">
                        {laube.description}
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-ochre text-ochre" />
                          <span className="text-sm font-medium text-[#2C2C2C]">
                            4.8
                          </span>
                          <span className="text-xs text-muted">(12)</span>
                        </div>
                        <span className="text-sm text-muted">
                          {laube.maxGuests} Gäste
                        </span>
                      </div>

                      <div className="space-y-2 mb-4 text-sm text-muted">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {laube.address}, {laube.city}
                        </div>
                        {laube.distanceToRadweg && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-sage/20 text-sage px-2 py-1 rounded">
                              {laube.distanceToRadweg} km zum Radweg
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Amenities */}
                      {laube.amenities && laube.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {laube.amenities.slice(0, 3).map((amenity, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-cream-dark/50 text-[#2C2C2C] px-2 py-1 rounded"
                            >
                              {amenity}
                            </span>
                          ))}
                          {laube.amenities.length > 3 && (
                            <span className="text-xs text-muted px-2 py-1">
                              +{laube.amenities.length - 3} mehr
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-[#E8DFD3]">
                        <div>
                          <span className="text-2xl font-bold text-terracotta">
                            €{Number(laube.pricePerNight).toFixed(0)}
                          </span>
                          <span className="text-sm text-muted">/Nacht</span>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/listings/${laube.id}`);
                          }}
                          className="btn-primary text-sm py-2 px-4"
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted mb-4">
                  Keine Gartenlauben gefunden. Versuche, die Filter anzupassen.
                </p>
                <Button onClick={handleReset} className="btn-outline">
                  Filter zurücksetzen
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
