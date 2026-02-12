interface CheckoutResponse {
  url: string;
  sessionId: string;
}

export async function createBillingCheckoutSession(): Promise<CheckoutResponse> {
  const response = await fetch('/api/billing/checkout', {
    method: 'POST',
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({ message: 'Failed to start checkout' }))) as {
      message?: string;
    };
    throw new Error(error.message || 'Failed to start checkout');
  }

  return response.json();
}

export async function redirectToCheckout(): Promise<void> {
  const { url } = await createBillingCheckoutSession();
  window.location.href = url;
}
