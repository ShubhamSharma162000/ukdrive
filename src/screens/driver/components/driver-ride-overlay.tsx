import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Phone, MessageCircle, MapPin, Clock, User, Car, Shield, X, CheckCircle, CreditCard, Banknote, ChevronUp, ChevronDown } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import LiveTrackingChat from "@/components/live-tracking-chat";
import { DriverWebSocket } from "@/lib/websocket-manager";

interface DriverRideOverlayProps {
  rideId: string;
  onClose: () => void;
  driverLocation?: { lat: number; lng: number };
}

export default function DriverRideOverlay({ rideId, onClose, driverLocation }: DriverRideOverlayProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [pin, setPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [rideStarted, setRideStarted] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [panelHeight, setPanelHeight] = useState(65); // Start at 65% height
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Fetch ride details
  const { data: ride, isLoading } = useQuery({
    queryKey: ['/api/rides', rideId],
    enabled: !!rideId,
    refetchInterval: 2000,
    onSuccess: (data) => {
      console.log('🔄 Ride data updated:', data?.status, data);
    }
  });

  // Get driver info
  const storedDriverInfo = JSON.parse(localStorage.getItem('driverInfo') || '{}');

  // Calculate route from driver to pickup location
  useEffect(() => {
    if (ride && driverLocation && (ride as any).pickupLat && (ride as any).pickupLng) {
      const pickup = { lat: parseFloat((ride as any).pickupLat), lng: parseFloat((ride as any).pickupLng) };
      
      if (window.google && window.google.maps && window.google.maps.DirectionsService) {
        const directionsService = new window.google.maps.DirectionsService();
        
        directionsService.route({
          origin: driverLocation,
          destination: pickup,
          travelMode: window.google.maps.TravelMode.DRIVING,
        }, (result: any, status: any) => {
          if (status === 'OK' && result) {
            console.log('🗺️ Route from driver to pickup calculated:', result);
            // You can store this route data for display if needed
          }
        });
      }
    }
  }, [ride, driverLocation]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-green-100 text-green-800 border-green-200';
      case 'picked_up': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'awaiting_payment': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Ride Confirmed';
      case 'in_progress': return 'On the Way';
      case 'picked_up': return 'Passenger Picked Up';
      case 'awaiting_payment': return 'Awaiting Payment';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  // PIN Verification
  const verifyPinMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/rides/${rideId}/verify-pin`, {
        pin: pin.trim(),
        driverId: storedDriverInfo.id
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "PIN Verified!",
        description: "You can now start the ride",
      });
      setRideStarted(true);
      setPin("");
      queryClient.invalidateQueries({ queryKey: ['/api/rides', rideId] });
    },
    onError: (error: any) => {
      toast({
        title: "Invalid PIN",
        description: error.message || "Please check the PIN and try again",
        variant: "destructive",
      });
    },
  });

  // Start ride
  const startRideMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/rides/${rideId}/start`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Ride Started!",
        description: "The trip has begun",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/rides', rideId] });
    },
  });

  // Complete ride - use the correct endpoint that sets status to awaiting_payment
  const completeRideMutation = useMutation({
    mutationFn: async () => {
      console.log('🚀 [DEBUG] Completing ride with status:', (ride as any)?.status);
      console.log('🚀 [DEBUG] Using endpoint: POST /api/rides/' + rideId + '/mark-completed');
      const response = await apiRequest("POST", `/api/rides/${rideId}/mark-completed`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [DEBUG] Complete ride failed:', response.status, errorText);
        throw new Error(`Complete ride failed: ${response.status} ${errorText}`);
      }
      const result = await response.json();
      console.log('✅ [DEBUG] Complete ride response:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('✅ Ride completed successfully - now awaiting payment collection:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/rides', rideId] });
      
      // Don't show payment options here - they will show automatically when status becomes awaiting_payment
      toast({
        title: "Ride Completed!",
        description: "Please collect payment from passenger",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Complete Ride",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Cash payment confirmation
  const confirmCashPaymentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/rides/${rideId}/payment`, {
        paymentMethod: 'cash',
        amount: (ride as any)?.fare
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Cash Payment Confirmed!",
        description: "Ride completed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/rides', rideId] });
      
      // Close overlay after completion
      setTimeout(() => {
        onClose();
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Cash Payment Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Digital payment - create Razorpay payment link
  const createDigitalPaymentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/rides/${rideId}/create-digital-payment`);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.paymentLink?.short_url) {
        // Open Razorpay payment link in new window
        window.open(data.paymentLink.short_url, '_blank', 'width=600,height=700');
        toast({
          title: "Payment Link Created!",
          description: "Customer payment window opened. Ride will be completed when payment is successful.",
        });
        setShowPaymentOptions(false);
        
        // Auto-refresh ride data to check for payment completion
        const checkPaymentInterval = setInterval(() => {
          queryClient.invalidateQueries({ queryKey: ['/api/rides', rideId] });
        }, 3000);
        
        // Clear interval after 5 minutes
        setTimeout(() => clearInterval(checkPaymentInterval), 300000);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Payment Link",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });


  if (isLoading) {
    return (
      <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <div className="animate-pulse">Loading ride details...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!ride) {
    return null;
  }

  // Toggle panel between collapsed and expanded
  const togglePanelHeight = () => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setPanelHeight(65); // Expand
    } else {
      setIsCollapsed(true);
      setPanelHeight(8); // Collapse to small bar
    }
  };

  return (
    <>
      {/* Backdrop when panel is expanded */}
      {panelHeight > 50 && !isCollapsed && (
        <div 
          className="absolute inset-0 bg-black bg-opacity-20 z-20"
          onClick={() => setPanelHeight(40)}
        />
      )}

      {/* Draggable Panel */}
      <div 
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-30 transition-all duration-300 ease-out"
        style={{ height: `${panelHeight}%` }}
      >
        {/* Drag Handle */}
        <div 
          className="w-full h-10 flex items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-t-3xl transition-colors duration-200"
          onClick={togglePanelHeight}
        >
          <div className="text-gray-600 text-lg font-bold">
            {isCollapsed ? (
              <div className="animate-bounce">▲</div>
            ) : (
              <div>▼</div>
            )}
          </div>
        </div>

        {/* Collapsed Content */}
        {isCollapsed && panelHeight > 8 ? (
          <div className="px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 flex items-center justify-center">
                <Car className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Active Ride</p>
                <p className="text-xs text-gray-500 truncate max-w-32">{(ride as any).pickupLocation}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">₹{(ride as any).fare}</p>
              <Badge className={`${getStatusColor((ride as any).status)} border text-xs`}>
                {getStatusText((ride as any).status)}
              </Badge>
            </div>
          </div>
        ) : isCollapsed ? null : (
          /* Panel Content */
          <div className="h-full overflow-y-auto pb-20">
            {/* Ride Info Header */}
            <div className="px-6 pt-4 pb-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Car className="w-6 h-6 text-orange-600" />
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">Active Ride</h3>
                      <Badge className={`${getStatusColor((ride as any).status)} border text-xs`}>
                        {getStatusText((ride as any).status)}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">₹{(ride as any).fare}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="px-6 pb-4">
                <div className="text-sm text-gray-600 space-y-3">
                <div className="flex">
                  <span className="font-medium text-gray-800 w-20 flex-shrink-0">Pickup:</span>
                  <span className="text-gray-600">{(ride as any).pickupLocation}</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-800 w-20 flex-shrink-0">Drop:</span>
                  <span className="text-gray-600">{(ride as any).destination}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-orange-600 w-20 flex-shrink-0">
                    <MapPin className="w-4 h-4 inline mr-1" />Status:
                  </span>
                  <span className="text-orange-600 font-medium">
                    {(ride as any).status === 'confirmed' ? 'Ready to start' : 'In progress'}
                  </span>
                </div>
              </div>
            </div>

            {/* Passenger Info */}
            <div className="px-6 pb-4">
              <div className="bg-gradient-to-r from-blue-50 to-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <User className="w-6 h-6 text-gray-600" />
                    <div>
                      <h4 className="font-semibold text-gray-800">{(ride as any).passengerName || 'Passenger'}</h4>
                      <p className="text-sm text-gray-500">PIN: {(ride as any).pin}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="h-10 w-10 p-0">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-10 w-10 p-0"
                      onClick={() => setIsChatOpen(true)}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* PIN Verification */}
            {(ride as any).status === 'confirmed' && !rideStarted && (
              <div className="px-6 pb-4">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4">
                  <div className="space-y-4">
                    <div className="text-center">
                      <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-gray-800">Verify PIN to Start Ride</h4>
                      <p className="text-sm text-gray-500">Ask passenger for their PIN</p>
                    </div>
                    
                    <div>
                      <Label htmlFor="pin" className="block text-xs font-bold text-green-600 uppercase tracking-wide mb-3">
                        Enter PIN Code
                      </Label>
                      <Input
                        id="pin"
                        type="text"
                        placeholder="ABCD"
                        value={pin}
                        onChange={(e) => {
                          const value = e.target.value.slice(0, 4);
                          setPin(value.toUpperCase());
                        }}
                        maxLength={4}
                        className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 text-center text-xl tracking-widest font-bold uppercase"
                      />
                    </div>
                    
                    <Button
                      onClick={() => verifyPinMutation.mutate()}
                      disabled={!pin.trim() || verifyPinMutation.isPending}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold"
                    >
                      {verifyPinMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Verify & Start Ride
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="px-6 pb-8">
              {(ride as any).status === 'confirmed' && rideStarted && (
                <Button
                  onClick={() => startRideMutation.mutate()}
                  disabled={startRideMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold"
                >
                  {startRideMutation.isPending ? "Starting..." : "🚗 Start Ride"}
                </Button>
              )}

              {((ride as any).status === 'in_progress' || (ride as any).status === 'picked_up') && (
                <Button
                  onClick={() => completeRideMutation.mutate()}
                  disabled={completeRideMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
                >
                  {completeRideMutation.isPending ? "Completing..." : "✅ Complete Ride"}
                </Button>
              )}

              {/* DEBUG: Show current status */}
              <div className="mb-2 p-2 bg-gray-100 rounded text-xs space-y-1">
                <div>Debug: Current status = "{(ride as any).status}"</div>
                <div>Ride ID = "{rideId}"</div>
                <div>Pin Verified = {(ride as any).pinVerified ? 'YES' : 'NO'}</div>
                <div>Ride Started = {rideStarted ? 'YES' : 'NO'}</div>
              </div>

              {(ride as any).status === 'awaiting_payment' && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                    <div className="text-center mb-4">
                      <h4 className="font-semibold text-yellow-800 mb-1">Choose Payment Method</h4>
                      <p className="text-sm text-yellow-600">
                        How did the passenger pay for this ride?
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Cash Payment Button */}
                      <Button
                        onClick={() => confirmCashPaymentMutation.mutate()}
                        disabled={confirmCashPaymentMutation.isPending}
                        variant="outline"
                        className="w-full h-16 flex items-center justify-start gap-4 border-2 hover:bg-gray-50"
                        data-testid="button-cash-payment"
                      >
                        <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                          <Banknote className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">Cash Payment</div>
                          <div className="text-sm text-gray-600">Passenger paid with cash</div>
                        </div>
                      </Button>

                      {/* Digital Payment Button */}
                      <Button
                        onClick={() => createDigitalPaymentMutation.mutate()}
                        disabled={createDigitalPaymentMutation.isPending}
                        className="w-full h-16 flex items-center justify-start gap-4 bg-green-600 hover:bg-green-700"
                        data-testid="button-digital-payment"
                      >
                        <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg">
                          <CreditCard className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">Digital Payment</div>
                          <div className="text-sm opacity-90">Create Razorpay Payment Link</div>
                        </div>
                      </Button>

                      {(confirmCashPaymentMutation.isPending || createDigitalPaymentMutation.isPending) && (
                        <div className="flex items-center justify-center py-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600 mr-2"></div>
                          <span className="text-sm text-yellow-600">
                            {confirmCashPaymentMutation.isPending ? "Confirming cash payment..." : "Creating payment link..."}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {(ride as any).status === 'completed' && (
                <div className="text-center py-4">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-green-600 text-lg">Ride Completed!</h4>
                  <p className="text-sm text-gray-500">Payment confirmed</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Chat Component - LiveTrackingChat manages its own messages internally */}
      <LiveTrackingChat
        userType="driver"
        rideId={rideId}
        messages={[]} // LiveTrackingChat uses internalMessages state
        isConnected={true}
        connectionError={null}
        onSendMessage={(message: string, rideId: string) => {
          // Send message via WebSocket
          DriverWebSocket.sendChatMessage(rideId, message);
          console.log('💬 Driver sending message:', message, 'for ride:', rideId);
        }}
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
      />
    </>
  );
}
