import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function HostDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"listings" | "bookings">("listings");
  const [showNewListingForm, setShowNewListingForm] = useState(false);
  const [newListing, setNewListing] = useState({
    title: "",
    description: "",
    city: "",
    address: "",
    postalCode: "",
    pricePerNight: "",
    maxGuests: "",
    distanceToRadweg: "",
  });

  const { data: hostListings } = trpc.gartenlauben.list.useQuery(
    { city: "", maxPrice: 10000, maxDistanceToRadweg: 1000 },
    { enabled: isAuthenticated }
  );

  const { data: bookingRequests } = trpc.bookings.myBookings.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const createListingMutation = trpc.gartenlauben.create.useMutation({
    onSuccess: () => {
      setShowNewListingForm(false);
      setNewListing({
        title: "",
        description: "",
        city: "",
        address: "",
        postalCode: "",
        pricePerNight: "",
        maxGuests: "",
        distanceToRadweg: "",
      });
    },
  }) as any;

  const confirmBookingMutation = trpc.bookings.confirm.useMutation();
  const rejectBookingMutation = trpc.bookings.reject.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#F5F1E8" }}>
        <div className="container py-12 text-center">
          <p style={{ color: "#2C2C2C" }} className="text-lg font-bold mb-4">
            Bitte melden Sie sich an
          </p>
          <Button onClick={() => startLogin()} className="btn-primary">
            Anmelden
          </Button>
        </div>
      </div>
    );
  }

  const handleCreateListing = () => {
    (createListingMutation.mutate as any)({
      title: newListing.title,
      description: newListing.description,
      city: newListing.city,
      address: newListing.address,
      postalCode: newListing.postalCode,
      pricePerNight: newListing.pricePerNight,
      maxGuests: newListing.maxGuests,
      distanceToRadweg: newListing.distanceToRadweg || undefined,
      amenities: [],
      hostId: user?.id!,
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F1E8" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-sm" style={{ backgroundColor: "rgba(245, 241, 232, 0.95)", borderBottom: "1px solid #E8DFD3" }}>
        <div className="container py-6">
          <h1 style={{ color: "#2C2C2C" }} className="text-3xl font-bold">
            Gastgeber-Dashboard
          </h1>
          <p style={{ color: "#8B8B8B" }} className="mt-2">
            Willkommen, {user?.name}
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b" style={{ borderColor: "#E8DFD3" }}>
          <button
            onClick={() => setActiveTab("listings")}
            className="px-4 py-3 font-semibold transition-colors"
            style={{
              color: activeTab === "listings" ? "#C85A3A" : "#8B8B8B",
              borderBottom: activeTab === "listings" ? "2px solid #C85A3A" : "none",
            }}
          >
            Meine Lauben
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className="px-4 py-3 font-semibold transition-colors"
            style={{
              color: activeTab === "bookings" ? "#C85A3A" : "#8B8B8B",
              borderBottom: activeTab === "bookings" ? "2px solid #C85A3A" : "none",
            }}
          >
            Buchungsanfragen
          </button>
        </div>

        {/* Listings Tab */}
        {activeTab === "listings" && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 style={{ color: "#2C2C2C" }} className="text-2xl font-bold">
                Meine Gartenlauben
              </h2>
              <Button
                onClick={() => setShowNewListingForm(!showNewListingForm)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Neue Laube
              </Button>
            </div>

            {/* New Listing Form */}
            {showNewListingForm && (
              <Card className="p-6 mb-8" style={{ backgroundColor: "white", border: "1px solid #E8DFD3" }}>
                <h3 style={{ color: "#2C2C2C" }} className="text-lg font-bold mb-4">
                  Neue Gartenlaube hinzufügen
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Input
                    placeholder="Titel"
                    value={newListing.title}
                    onChange={(e) =>
                      setNewListing({ ...newListing, title: e.target.value })
                    }
                    style={{ backgroundColor: "#F5F1E8", borderColor: "#E8DFD3" }}
                  />
                  <Input
                    placeholder="Stadt"
                    value={newListing.city}
                    onChange={(e) =>
                      setNewListing({ ...newListing, city: e.target.value })
                    }
                    style={{ backgroundColor: "#F5F1E8", borderColor: "#E8DFD3" }}
                  />
                  <Input
                    placeholder="Adresse"
                    value={newListing.address}
                    onChange={(e) =>
                      setNewListing({ ...newListing, address: e.target.value })
                    }
                    style={{ backgroundColor: "#F5F1E8", borderColor: "#E8DFD3" }}
                  />
                  <Input
                    placeholder="Postleitzahl"
                    value={newListing.postalCode}
                    onChange={(e) =>
                      setNewListing({ ...newListing, postalCode: e.target.value })
                    }
                    style={{ backgroundColor: "#F5F1E8", borderColor: "#E8DFD3" }}
                  />
                  <Input
                    type="number"
                    placeholder="Preis pro Nacht (€)"
                    value={newListing.pricePerNight}
                    onChange={(e) =>
                      setNewListing({ ...newListing, pricePerNight: e.target.value })
                    }
                    style={{ backgroundColor: "#F5F1E8", borderColor: "#E8DFD3" }}
                  />
                  <Input
                    type="number"
                    placeholder="Max. Gäste"
                    value={newListing.maxGuests}
                    onChange={(e) =>
                      setNewListing({ ...newListing, maxGuests: e.target.value })
                    }
                    style={{ backgroundColor: "#F5F1E8", borderColor: "#E8DFD3" }}
                  />
                  <Input
                    type="number"
                    placeholder="Entfernung zum Radweg (km)"
                    value={newListing.distanceToRadweg}
                    onChange={(e) =>
                      setNewListing({ ...newListing, distanceToRadweg: e.target.value })
                    }
                    style={{ backgroundColor: "#F5F1E8", borderColor: "#E8DFD3" }}
                  />
                </div>
                <Textarea
                  placeholder="Beschreibung"
                  value={newListing.description}
                  onChange={(e) =>
                    setNewListing({ ...newListing, description: e.target.value })
                  }
                  className="mb-4"
                  style={{ backgroundColor: "#F5F1E8", borderColor: "#E8DFD3" }}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateListing}
                    className="btn-primary"
                    disabled={createListingMutation.isPending}
                  >
                    {createListingMutation.isPending ? "Wird erstellt..." : "Erstellen"}
                  </Button>
                  <Button
                    onClick={() => setShowNewListingForm(false)}
                    className="btn-outline"
                  >
                    Abbrechen
                  </Button>
                </div>
              </Card>
            )}

            {/* Listings Grid */}
            <div className="grid grid-cols-2 gap-6">
              {hostListings?.map((listing: any) => (
                <Card
                  key={listing.id}
                  className="p-6 overflow-hidden"
                  style={{ backgroundColor: "white", border: "1px solid #E8DFD3" }}
                >
                  <div className="mb-4 h-40 rounded-lg bg-gradient-to-br from-terracotta/20 to-sage/20 flex items-center justify-center">
                    <span style={{ color: "#8B8B8B" }}>Foto</span>
                  </div>
                  <h3 style={{ color: "#2C2C2C" }} className="font-bold text-lg mb-2">
                    {listing.title}
                  </h3>
                  <p style={{ color: "#8B8B8B" }} className="text-sm mb-4">
                    {listing.city}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span style={{ color: "#C85A3A" }} className="font-bold text-lg">
                      €{Number(listing.pricePerNight).toFixed(0)}/Nacht
                    </span>
                    <span style={{ color: "#8B8B8B" }} className="text-sm">
                      {listing.maxGuests} Gäste
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 btn-secondary flex items-center justify-center gap-2">
                      <Edit2 className="w-4 h-4" />
                      Bearbeiten
                    </Button>
                    <Button className="flex-1 btn-outline flex items-center justify-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Löschen
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div>
            <h2 style={{ color: "#2C2C2C" }} className="text-2xl font-bold mb-6">
              Buchungsanfragen
            </h2>

            <div className="space-y-4">
              {bookingRequests?.map((booking: any) => (
                <Card
                  key={booking.id}
                  className="p-6"
                  style={{ backgroundColor: "white", border: "1px solid #E8DFD3" }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 style={{ color: "#2C2C2C" }} className="font-bold text-lg">
                        Buchung #{booking.id}
                      </h3>
                      <p style={{ color: "#8B8B8B" }} className="text-sm">
                        Gast: {booking.guestName || "Unbekannt"}
                      </p>
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2"
                      style={{
                        backgroundColor:
                          booking.status === "confirmed"
                            ? "#E8F5E9"
                            : booking.status === "rejected"
                              ? "#FFEBEE"
                              : "#FFF3E0",
                        color:
                          booking.status === "confirmed"
                            ? "#2E7D32"
                            : booking.status === "rejected"
                              ? "#C62828"
                              : "#E65100",
                      }}
                    >
                      {booking.status === "confirmed" && <CheckCircle className="w-4 h-4" />}
                      {booking.status === "rejected" && <XCircle className="w-4 h-4" />}
                      {booking.status === "pending" && <Clock className="w-4 h-4" />}
                      {booking.status === "confirmed"
                        ? "Bestätigt"
                        : booking.status === "rejected"
                          ? "Abgelehnt"
                          : "Ausstehend"}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4 p-4 rounded-lg" style={{ backgroundColor: "#F0E8DC" }}>
                    <div>
                      <p style={{ color: "#8B8B8B" }} className="text-xs">
                        Ankunft
                      </p>
                      <p style={{ color: "#2C2C2C" }} className="font-semibold">
                        {new Date(booking.checkInDate).toLocaleDateString("de-DE")}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: "#8B8B8B" }} className="text-xs">
                        Abreise
                      </p>
                      <p style={{ color: "#2C2C2C" }} className="font-semibold">
                        {new Date(booking.checkOutDate).toLocaleDateString("de-DE")}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: "#8B8B8B" }} className="text-xs">
                        Gesamtpreis
                      </p>
                      <p style={{ color: "#C85A3A" }} className="font-bold">
                        €{Number(booking.totalPrice).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {booking.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => confirmBookingMutation.mutate({ id: booking.id })}
                        className="flex-1 btn-secondary"
                      >
                        Bestätigen
                      </Button>
                      <Button
                        onClick={() => rejectBookingMutation.mutate({ id: booking.id })}
                        className="flex-1 btn-outline"
                      >
                        Ablehnen
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
