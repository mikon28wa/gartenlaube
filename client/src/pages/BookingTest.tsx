import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface TestBooking {
  gartenlaubeId: number;
  guestId: number;
  hostId: number;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: string;
  guestMessage?: string;
}

export default function BookingTest() {
  const [testMode, setTestMode] = useState<"create" | "list" | "manage">("create");
  const [formData, setFormData] = useState<TestBooking>({
    gartenlaubeId: 1,
    guestId: 1,
    hostId: 1,
    checkInDate: "2026-07-15",
    checkOutDate: "2026-07-17",
    numberOfGuests: 2,
    totalPrice: "150.00",
    guestMessage: "Ich freue mich auf meinen Aufenthalt!",
  });

  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // tRPC Queries
  const { data: allBookings } = trpc.bookings.myBookings.useQuery(undefined);
  const createBookingMutation = trpc.bookings.create.useMutation();
  const confirmBookingMutation = trpc.bookings.confirm.useMutation();
  const rejectBookingMutation = trpc.bookings.reject.useMutation();

  const handleCreateBooking = async () => {
    setIsLoading(true);
    try {
      const result = await (createBookingMutation.mutateAsync as any)({
        gartenlaubeId: formData.gartenlaubeId,
        guestId: formData.guestId,
        hostId: formData.hostId,
        checkInDate: new Date(formData.checkInDate),
        checkOutDate: new Date(formData.checkOutDate),
        numberOfGuests: formData.numberOfGuests,
        totalPrice: formData.totalPrice,
        guestMessage: formData.guestMessage,
      });

      setTestResults([
        ...testResults,
        {
          id: Date.now(),
          test: "Buchung erstellen",
          status: "success",
          data: result,
          timestamp: new Date().toLocaleTimeString("de-DE"),
        },
      ]);
    } catch (error: any) {
      setTestResults([
        ...testResults,
        {
          id: Date.now(),
          test: "Buchung erstellen",
          status: "error",
          error: error.message,
          timestamp: new Date().toLocaleTimeString("de-DE"),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmBooking = async (bookingId: number) => {
    setIsLoading(true);
    try {
      const result = await confirmBookingMutation.mutateAsync({ id: bookingId });
      setTestResults([
        ...testResults,
        {
          id: Date.now(),
          test: `Buchung ${bookingId} bestätigen`,
          status: "success",
          data: result,
          timestamp: new Date().toLocaleTimeString("de-DE"),
        },
      ]);
    } catch (error: any) {
      setTestResults([
        ...testResults,
        {
          id: Date.now(),
          test: `Buchung ${bookingId} bestätigen`,
          status: "error",
          error: error.message,
          timestamp: new Date().toLocaleTimeString("de-DE"),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectBooking = async (bookingId: number) => {
    setIsLoading(true);
    try {
      const result = await rejectBookingMutation.mutateAsync({ id: bookingId });
      setTestResults([
        ...testResults,
        {
          id: Date.now(),
          test: `Buchung ${bookingId} ablehnen`,
          status: "success",
          data: result,
          timestamp: new Date().toLocaleTimeString("de-DE"),
        },
      ]);
    } catch (error: any) {
      setTestResults([
        ...testResults,
        {
          id: Date.now(),
          test: `Buchung ${bookingId} ablehnen`,
          status: "error",
          error: error.message,
          timestamp: new Date().toLocaleTimeString("de-DE"),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F1E8" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-sm" style={{ backgroundColor: "rgba(245, 241, 232, 0.95)", borderBottom: "1px solid #E8DFD3" }}>
        <div className="container py-6">
          <h1 style={{ color: "#2C2C2C" }} className="text-3xl font-bold">
            Buchungsfunktion Test
          </h1>
          <p style={{ color: "#8B8B8B" }} className="text-sm mt-2">
            Überprüfe die Buchungsfunktion für Gartenlauben
          </p>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Test Controls */}
          <div className="col-span-1">
            <Card className="p-6 sticky top-24" style={{ backgroundColor: "white", border: "1px solid #E8DFD3" }}>
              <h2 style={{ color: "#2C2C2C" }} className="text-lg font-bold mb-4">
                Test-Modus
              </h2>

              <div className="space-y-3 mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="testMode"
                    value="create"
                    checked={testMode === "create"}
                    onChange={(e) => setTestMode(e.target.value as any)}
                    style={{ accentColor: "#C85A3A" }}
                  />
                  <span style={{ color: "#2C2C2C" }}>Buchung erstellen</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="testMode"
                    value="list"
                    checked={testMode === "list"}
                    onChange={(e) => setTestMode(e.target.value as any)}
                    style={{ accentColor: "#C85A3A" }}
                  />
                  <span style={{ color: "#2C2C2C" }}>Buchungen auflisten</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="testMode"
                    value="manage"
                    checked={testMode === "manage"}
                    onChange={(e) => setTestMode(e.target.value as any)}
                    style={{ accentColor: "#C85A3A" }}
                  />
                  <span style={{ color: "#2C2C2C" }}>Buchungen verwalten</span>
                </label>
              </div>

              {testMode === "create" && (
                <div className="space-y-4">
                  <div>
                    <label style={{ color: "#8B8B8B" }} className="text-xs font-semibold block mb-2">
                      Gartenlaube ID
                    </label>
                    <Input
                      type="number"
                      value={formData.gartenlaubeId}
                      onChange={(e) =>
                        setFormData({ ...formData, gartenlaubeId: parseInt(e.target.value) })
                      }
                      style={{ backgroundColor: "white", borderColor: "#E8DFD3" }}
                    />
                  </div>

                  <div>
                    <label style={{ color: "#8B8B8B" }} className="text-xs font-semibold block mb-2">
                      Gast ID
                    </label>
                    <Input
                      type="number"
                      value={formData.guestId}
                      onChange={(e) =>
                        setFormData({ ...formData, guestId: parseInt(e.target.value) })
                      }
                      style={{ backgroundColor: "white", borderColor: "#E8DFD3" }}
                    />
                  </div>

                  <div>
                    <label style={{ color: "#8B8B8B" }} className="text-xs font-semibold block mb-2">
                      Gastgeber ID
                    </label>
                    <Input
                      type="number"
                      value={formData.hostId}
                      onChange={(e) =>
                        setFormData({ ...formData, hostId: parseInt(e.target.value) })
                      }
                      style={{ backgroundColor: "white", borderColor: "#E8DFD3" }}
                    />
                  </div>

                  <div>
                    <label style={{ color: "#8B8B8B" }} className="text-xs font-semibold block mb-2">
                      Ankunftsdatum
                    </label>
                    <Input
                      type="date"
                      value={formData.checkInDate}
                      onChange={(e) =>
                        setFormData({ ...formData, checkInDate: e.target.value })
                      }
                      style={{ backgroundColor: "white", borderColor: "#E8DFD3" }}
                    />
                  </div>

                  <div>
                    <label style={{ color: "#8B8B8B" }} className="text-xs font-semibold block mb-2">
                      Abreisedatum
                    </label>
                    <Input
                      type="date"
                      value={formData.checkOutDate}
                      onChange={(e) =>
                        setFormData({ ...formData, checkOutDate: e.target.value })
                      }
                      style={{ backgroundColor: "white", borderColor: "#E8DFD3" }}
                    />
                  </div>

                  <div>
                    <label style={{ color: "#8B8B8B" }} className="text-xs font-semibold block mb-2">
                      Anzahl Gäste
                    </label>
                    <Input
                      type="number"
                      value={formData.numberOfGuests}
                      onChange={(e) =>
                        setFormData({ ...formData, numberOfGuests: parseInt(e.target.value) })
                      }
                      style={{ backgroundColor: "white", borderColor: "#E8DFD3" }}
                    />
                  </div>

                  <div>
                    <label style={{ color: "#8B8B8B" }} className="text-xs font-semibold block mb-2">
                      Gesamtpreis
                    </label>
                    <Input
                      type="text"
                      value={formData.totalPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, totalPrice: e.target.value })
                      }
                      style={{ backgroundColor: "white", borderColor: "#E8DFD3" }}
                    />
                  </div>

                  <div>
                    <label style={{ color: "#8B8B8B" }} className="text-xs font-semibold block mb-2">
                      Nachricht
                    </label>
                    <Input
                      type="text"
                      value={formData.guestMessage}
                      onChange={(e) =>
                        setFormData({ ...formData, guestMessage: e.target.value })
                      }
                      style={{ backgroundColor: "white", borderColor: "#E8DFD3" }}
                      placeholder="Optional"
                    />
                  </div>

                  <Button
                    onClick={handleCreateBooking}
                    disabled={isLoading}
                    className="w-full btn-primary"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Wird erstellt...
                      </>
                    ) : (
                      "Buchung erstellen"
                    )}
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Results */}
          <div className="col-span-2">
            {testMode === "create" && (
              <div className="space-y-4">
                <h2 style={{ color: "#2C2C2C" }} className="text-lg font-bold">
                  Test-Ergebnisse
                </h2>

                {testResults.length === 0 ? (
                  <Card className="p-6 text-center" style={{ backgroundColor: "white", border: "1px solid #E8DFD3" }}>
                    <Calendar className="w-12 h-12 mx-auto mb-3" style={{ color: "#E8DFD3" }} />
                    <p style={{ color: "#8B8B8B" }}>
                      Keine Tests durchgeführt. Klicken Sie auf "Buchung erstellen", um zu beginnen.
                    </p>
                  </Card>
                ) : (
                  testResults.map((result) => (
                    <Card
                      key={result.id}
                      className="p-4"
                      style={{
                        backgroundColor: "white",
                        border: `2px solid ${result.status === "success" ? "#4CAF50" : "#FF6B6B"}`,
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {result.status === "success" ? (
                          <CheckCircle className="w-5 h-5 mt-1" style={{ color: "#4CAF50" }} />
                        ) : (
                          <AlertCircle className="w-5 h-5 mt-1" style={{ color: "#FF6B6B" }} />
                        )}
                        <div className="flex-1">
                          <h3 style={{ color: "#2C2C2C" }} className="font-bold">
                            {result.test}
                          </h3>
                          <p style={{ color: "#8B8B8B" }} className="text-xs mb-2">
                            {result.timestamp}
                          </p>
                          {result.status === "success" ? (
                            <pre
                              style={{
                                backgroundColor: "#F0E8DC",
                                color: "#2C2C2C",
                                padding: "0.75rem",
                                borderRadius: "0.375rem",
                                fontSize: "0.75rem",
                                overflow: "auto",
                              }}
                            >
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          ) : (
                            <p style={{ color: "#FF6B6B" }} className="text-sm">
                              {result.error}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {testMode === "list" && (
              <div className="space-y-4">
                <h2 style={{ color: "#2C2C2C" }} className="text-lg font-bold">
                  Alle Buchungen
                </h2>

                {allBookings && allBookings.length > 0 ? (
                  allBookings.map((booking: any) => (
                    <Card
                      key={booking.id}
                      className="p-4"
                      style={{ backgroundColor: "white", border: "1px solid #E8DFD3" }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 style={{ color: "#2C2C2C" }} className="font-bold">
                            Buchung #{booking.id}
                          </h3>
                          <p style={{ color: "#8B8B8B" }} className="text-sm">
                            Gast ID: {booking.guestId} | Gastgeber ID: {booking.hostId}
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
                          {booking.status}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-3 p-3 rounded-lg" style={{ backgroundColor: "#F0E8DC" }}>
                        <div>
                          <p style={{ color: "#8B8B8B" }} className="text-xs">
                            Ankunft
                          </p>
                          <p style={{ color: "#2C2C2C" }} className="font-semibold text-sm">
                            {new Date(booking.checkInDate).toLocaleDateString("de-DE")}
                          </p>
                        </div>
                        <div>
                          <p style={{ color: "#8B8B8B" }} className="text-xs">
                            Abreise
                          </p>
                          <p style={{ color: "#2C2C2C" }} className="font-semibold text-sm">
                            {new Date(booking.checkOutDate).toLocaleDateString("de-DE")}
                          </p>
                        </div>
                        <div>
                          <p style={{ color: "#8B8B8B" }} className="text-xs">
                            Preis
                          </p>
                          <p style={{ color: "#C85A3A" }} className="font-bold text-sm">
                            €{Number(booking.totalPrice).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {booking.guestMessage && (
                        <p style={{ color: "#8B8B8B" }} className="text-sm italic">
                          "{booking.guestMessage}"
                        </p>
                      )}
                    </Card>
                  ))
                ) : (
                  <Card className="p-6 text-center" style={{ backgroundColor: "white", border: "1px solid #E8DFD3" }}>
                    <Calendar className="w-12 h-12 mx-auto mb-3" style={{ color: "#E8DFD3" }} />
                    <p style={{ color: "#8B8B8B" }}>
                      Keine Buchungen gefunden
                    </p>
                  </Card>
                )}
              </div>
            )}

            {testMode === "manage" && (
              <div className="space-y-4">
                <h2 style={{ color: "#2C2C2C" }} className="text-lg font-bold">
                  Buchungen verwalten
                </h2>

                {allBookings && allBookings.length > 0 ? (
                  allBookings
                    .filter((b: any) => b.status === "pending")
                    .map((booking: any) => (
                      <Card
                        key={booking.id}
                        className="p-4"
                        style={{ backgroundColor: "white", border: "1px solid #E8DFD3" }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 style={{ color: "#2C2C2C" }} className="font-bold">
                              Buchung #{booking.id} - Ausstehend
                            </h3>
                            <p style={{ color: "#8B8B8B" }} className="text-sm">
                              {new Date(booking.checkInDate).toLocaleDateString("de-DE")} bis{" "}
                              {new Date(booking.checkOutDate).toLocaleDateString("de-DE")}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleConfirmBooking(booking.id)}
                            disabled={isLoading}
                            className="flex-1 btn-secondary"
                          >
                            {isLoading ? "Wird verarbeitet..." : "Bestätigen"}
                          </Button>
                          <Button
                            onClick={() => handleRejectBooking(booking.id)}
                            disabled={isLoading}
                            className="flex-1 btn-outline"
                          >
                            {isLoading ? "Wird verarbeitet..." : "Ablehnen"}
                          </Button>
                        </div>
                      </Card>
                    ))
                ) : (
                  <Card className="p-6 text-center" style={{ backgroundColor: "white", border: "1px solid #E8DFD3" }}>
                    <Calendar className="w-12 h-12 mx-auto mb-3" style={{ color: "#E8DFD3" }} />
                    <p style={{ color: "#8B8B8B" }}>
                      Keine ausstehenden Buchungen
                    </p>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
