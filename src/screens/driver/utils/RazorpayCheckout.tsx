import React, { useEffect } from 'react';
import { WebView } from 'react-native-webview';

export default function RazorpayCheckout({
  amount,
  orderId,
  onSuccess,
  onCancel,
}: any) {
  const html = `
    <html>
      <body>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <script>
          var options = {
            key: "rzp_live_R7Hfkqef2YC7Ca",
            amount: ${amount * 100},
            order_id: "${orderId}",
            handler: function(response){
              window.ReactNativeWebView.postMessage(JSON.stringify({
                success: true,
                data: response
              }))
            },
            modal: {
              ondismiss: function(){
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  success: false
                }))
              }
            }
          };
          var rzp = new Razorpay(options);
          rzp.open();
        </script>
      </body>
    </html>
  `;
  console.log('i am here at checkout component ');
  return (
    <WebView
      source={{ html }}
      javaScriptEnabled={true} // must be true
      domStorageEnabled={true} // also needed for Razorpay script
      originWhitelist={['*']} // allow all origins
      onMessage={e => {
        console.log('WebView message:', e.nativeEvent.data);
      }}
    />
  );
}
