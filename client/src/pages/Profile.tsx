import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Heart, MapPin, Star, Calendar, LogOut } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"bookings" | "favorites" | "settings">("bookings");
  const [isEditing, setIsEditing] = useState(false);

  const { data: myBookings } = trpc.bookings.myBookings.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: favorites } = trpc.gartenlauben.list.useQuery(
    { city: "", maxPrice: 10000, maxDistanceToRadweg: 1000 },
    { enabled: isAuthenticated }
  );

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

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F1E8" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-sm" style={{ backgroundColor: "rgba(245, 241, 232, 0.95)", borderBottom: "1px solid #E8DFD3" }}>
        <div className="container py-6 flex items-center justify-between">
          <h1 style={{ color: "#2C2C2C" }} className="text-3xl font-bold">
            Mein Profil
          </h1>
          <Button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="btn-outline flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Abmelden
          </Button>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-3 gap-8 mb-8">
          {/* Profile Card */}
          <Card className="col-span-1 p-6" style={{ backgroundColor: "white", border: "1px solid #E8DFD3" }}>
            <div className="text-center mb-6">
              <div
                className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: "#E8DFD3" }}
              >
                <span style={{ color: "#8B8B8B", fontSize: "2rem" }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 style={{ color: "#2C2C2C" }} className="text-xl font-bold mb-1">
                {user?.name}
              </h2>
              <p style={{ color: "#8B8B8B" }} className="text-sm">
                {user?.email}
              </p>
            </div>

            <div className="space-y-3 mb-6 pt-6" style={{ borderTop: "1px solid #E8DFD3" }}>
              <div>
                <p style={{ color: "#8B8B8B" }} className="text-xs">
                  Mitglied seit
                </p>
                <p style={{ color: "#2C2C2C" }} className="font-semibold">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("de-DE") : "—"}
                </p>
              </div>
              <div>
                <p style={{ color: "#8B8B8B" }} className="text-xs">
                  Zuletzt angemeldet
                </p>
                <p style={{ color: "#2C2C2C" }} className="font-semibold">
                  {user?.lastSignedIn ? new Date(user.lastSignedIn).toLocaleDateString("de-DE") : "—"}
                </p>
              </div>
            </div>

            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                className="w-full btn-secondary"
              >
                Profil bearbeiten
              </Button>
            )}
          </Card>

          {/* Content Area */}
          <div className="col-span-2">
            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b" style={{ borderColor: "#E8DFD3" }}>
              <button
                onClick={() => setActiveTab("bookings")}
                className="px-4 py-3 font-semibold transition-colors"
                style={{
                  color: activeTab === "bookings" ? "#C85A3A" : "#8B8B8B",
                  borderBottom: activeTab === "bookings" ? "2px solid #C85A3A" : "none",
                }}
              >
                Meine Buchungen
              </button>
              <button
                onClick={() => setActiveTab("favorites")}
                className="px-4 py-3 font-semibold transition-colors flex items-center gap-2"
                style={{
                  color: activeTab === "favorites" ? "#C85A3A" : "#8B8B8B",
                  borderBottom: activeTab === "favorites" ? "2px solid #C85A3A" : "none",
                }}
              >
                <Heart className="w-4 h-4" />
                Favoriten
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className="px-4 py-3 font-semibold transition-colors"
                style={{
                  color: activeTab === "settings" ? "#C85A3A" : "#8B8B8B",
                  borderBottom: activeTab === "settings" ? "2px solid #C85A3A" : "none",
                }}
              >
                Einstellungen
              </button>
            </div>

            {/* Bookings Tab */}
            {activeTab === "bookings" && (
              <div className="space-y-4">
                {myBookings && myBookings.length > 0 ? (
                  myBookings.map((booking: any) => (
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
                            {booking.gartenlaubeTitle || "Gartenlaube"}
                          </p>
                        </div>
                        <div
                          className="px-3 py-1 rounded-full text-sm font-semibold"
                          style={{
                            backgroundColor:
                              booking.status === "confirmed" ? "#E8F5E9" : "#FFF3E0",
                            color:
                              booking.status === "confirmed" ? "#2E7D32" : "#E65100",
                          }}
                        >
                          {booking.status === "confirmed" ? "Bestätigt" : "Ausstehend"}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 p-4 rounded-lg" style={{ backgroundColor: "#F0E8DC" }}>
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
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 mx-auto mb-4" style={{ color: "#E8DFD3" }} />
                    <p style={{ color: "#8B8B8B" }}>
                      Sie haben noch keine Buchungen
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Favorites Tab */}
            {activeTab === "favorites" && (
              <div className="grid grid-cols-2 gap-4">
                {favorites && favorites.length > 0 ? (
                  favorites.map((fav: any) => (
                    <Card
                      key={fav.id}
                      className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                      style={{ backgroundColor: "white", border: "1px solid #E8DFD3" }}
                    >
                      <div className="h-32 rounded-lg bg-gradient-to-br from-terracotta/20 to-sage/20 flex items-center justify-center mb-3">
                        <MapPin className="w-8 h-8" style={{ color: "#C85A3A" }} />
                      </div>
                      <h3 style={{ color: "#2C2C2C" }} className="font-bold mb-1">
                        {fav.title}
                      </h3>
                      <p style={{ color: "#8B8B8B" }} className="text-sm mb-3">
                        {fav.city}
                      </p>
                      <div className="flex items-center justify-between">
                        <span style={{ color: "#C85A3A" }} className="font-bold">
                          €{Number(fav.pricePerNight).toFixed(0)}/Nacht
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-ochre" style={{ color: "#B8860B" }} />
                          <span style={{ color: "#2C2C2C" }} className="text-sm font-semibold">
                            4.8
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12">
                    <Heart className="w-12 h-12 mx-auto mb-4" style={{ color: "#E8DFD3" }} />
                    <p style={{ color: "#8B8B8B" }}>
                      Sie haben noch keine Favoriten
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <Card className="p-6" style={{ backgroundColor: "white", border: "1px solid #E8DFD3" }}>
                  <h3 style={{ color: "#2C2C2C" }} className="text-lg font-bold mb-4">
                    Benachrichtigungseinstellungen
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        style={{ accentColor: "#C85A3A" }}
                      />
                      <span style={{ color: "#2C2C2C" }}>
                        E-Mail-Benachrichtigungen bei neuen Buchungsanfragen
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        style={{ accentColor: "#C85A3A" }}
                      />
                      <span style={{ color: "#2C2C2C" }}>
                        E-Mail-Benachrichtigungen bei Buchungsbestätigung
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        style={{ accentColor: "#C85A3A" }}
                      />
                      <span style={{ color: "#2C2C2C" }}>
                        Newsletter mit neuen Lauben
                      </span>
                    </label>
                  </div>
                </Card>

                <Card className="p-6" style={{ backgroundColor: "white", border: "1px solid #E8DFD3" }}>
                  <h3 style={{ color: "#2C2C2C" }} className="text-lg font-bold mb-4">
                    Datenschutz
                  </h3>
                  <p style={{ color: "#8B8B8B" }} className="mb-4">
                    Ihre Daten sind sicher bei uns. Lesen Sie unsere Datenschutzrichtlinie für weitere Informationen.
                  </p>
                  <Button className="btn-outline">
                    Datenschutzrichtlinie anzeigen
                  </Button>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
