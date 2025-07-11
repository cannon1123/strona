import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "You are now a Premium subscriber!",
      });
      setLocation("/");
    }
  };

  return (
    <Card className="bg-secondary-dark border-gray-700 max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Complete Your Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <PaymentElement />
          <Button 
            type="submit" 
            className="w-full bg-premium text-black hover:bg-yellow-400"
            disabled={!stripe || !elements}
          >
            Subscribe to Premium
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    apiRequest("POST", "/api/create-subscription")
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "Failed to initialize payment",
          variant: "destructive",
        });
        console.error("Payment initialization error:", error);
      });
  }, [toast]);

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-primary-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-custom">Initializing payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="outline" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Upgrade to <span className="text-premium">Premium</span>
            </h1>
            <p className="text-xl text-gray-custom">
              Join thousands of satisfied subscribers
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Benefits */}
            <div>
              <Card className="bg-secondary-dark border-gray-700">
                <CardHeader>
                  <CardTitle>Premium Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-center">
                      <div className="w-6 h-6 bg-success-green rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <div>
                        <div className="font-semibold">No Advertisements</div>
                        <div className="text-sm text-gray-custom">Watch movies without interruptions</div>
                      </div>
                    </li>
                    <li className="flex items-center">
                      <div className="w-6 h-6 bg-success-green rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <div>
                        <div className="font-semibold">4K Ultra HD Quality</div>
                        <div className="text-sm text-gray-custom">Highest quality streaming available</div>
                      </div>
                    </li>
                    <li className="flex items-center">
                      <div className="w-6 h-6 bg-success-green rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <div>
                        <div className="font-semibold">Multiple Devices</div>
                        <div className="text-sm text-gray-custom">Watch on up to 4 devices simultaneously</div>
                      </div>
                    </li>
                    <li className="flex items-center">
                      <div className="w-6 h-6 bg-success-green rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <div>
                        <div className="font-semibold">Exclusive Content</div>
                        <div className="text-sm text-gray-custom">Access to premium movies and series</div>
                      </div>
                    </li>
                    <li className="flex items-center">
                      <div className="w-6 h-6 bg-success-green rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <div>
                        <div className="font-semibold">24/7 Support</div>
                        <div className="text-sm text-gray-custom">Priority customer support</div>
                      </div>
                    </li>
                  </ul>

                  <div className="mt-6 p-4 bg-premium/10 border border-premium/30 rounded-lg">
                    <div className="text-center">
                      <div className="text-premium text-3xl font-bold mb-2">19.99 zł / month</div>
                      <div className="text-gray-custom text-sm">Cancel anytime • No commitment</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Form */}
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <SubscribeForm />
            </Elements>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-custom">
              Secure payments powered by <span className="text-white font-semibold">Stripe</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
