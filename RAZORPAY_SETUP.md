# 💳 Razorpay Payment Integration - Setup Guide

## ✅ Backend Setup Complete

The backend is already configured with Razorpay integration. You just need to add your API keys.

---

## 🔑 Get Your Razorpay API Keys

### **Step 1: Create Razorpay Account**
1. Go to [https://dashboard.razorpay.com/signup](https://dashboard.razorpay.com/signup)
2. Sign up with your business email
3. Complete KYC verification (for live mode)

### **Step 2: Get Test Keys** (For Development)
1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to **Settings** → **API Keys**
3. Under **Test Mode**, click **Generate Test Key**
4. You'll get:
   - **Key ID**: `rzp_test_XXXXXXXXXXXX`
   - **Key Secret**: `XXXXXXXXXXXXXXXXXXXX`

### **Step 3: Add Keys to Backend**
Update `/app/backend/.env`:

```env
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_SECRET_KEY_HERE
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

### **Step 4: Add Key to Frontend**
Update `/app/frontend/.env`:

```env
REACT_APP_BACKEND_URL=https://your-backend-url.com
REACT_APP_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
```

### **Step 5: Restart Services**
```bash
sudo supervisorctl restart all
```

---

## 🧪 Testing with Test Cards

### **Test Card Numbers** (Razorpay Test Mode):

**Success Scenarios:**
```
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
```

**Failed Payment:**
```
Card Number: 4111 1111 1111 1112
CVV: Any 3 digits
Expiry: Any future date
```

### **Test UPI IDs:**
```
Success: success@razorpay
Failure: failure@razorpay
```

### **Test Netbanking:**
- Select any bank
- Username: Any
- Password: Any
- Result: Always successful in test mode

---

## 🔄 Payment Flow

### **Customer Journey:**
1. Customer adds items to cart
2. Proceeds to checkout
3. Enters delivery details
4. Clicks "Proceed to Payment"
5. Razorpay payment modal opens
6. Customer selects payment method:
   - **Cards** (Credit/Debit)
   - **UPI** (Google Pay, PhonePe, Paytm)
   - **Netbanking**
   - **Wallets** (Paytm, Mobikwik, etc.)
7. Payment is processed
8. On success:
   - Order status → "Confirmed"
   - Payment status → "Completed"
   - Customer redirected to order tracking
9. On failure:
   - Customer can retry
   - Order remains in pending state

---

## 🔒 Security Features Implemented

✅ **Payment signature verification** - Prevents tampering
✅ **Webhook signature validation** - Secure server-to-server communication
✅ **HTTPS enforcement** - Encrypted data transmission
✅ **No card data storage** - PCI DSS compliant
✅ **Rate limiting** - Prevents abuse

---

## 📊 Payment Status Flow

```
Order Created → Payment Pending
    ↓
Razorpay Payment Gateway
    ↓
Payment Success ✅
    ↓
Order Status: Confirmed
Payment Status: Completed
    ↓
Kitchen receives order
```

---

## 🎯 API Endpoints

### **1. Create Payment Order**
```
POST /api/payment/create-order
Body: {
  "amount": 50000,  // ₹500 in paise
  "currency": "INR",
  "order_id": "your-order-id"
}
Response: {
  "razorpay_order_id": "order_xxx",
  "amount": 50000,
  "currency": "INR",
  "key_id": "rzp_test_xxx"
}
```

### **2. Verify Payment**
```
POST /api/payment/verify
Body: {
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx",
  "order_id": "your-order-id"
}
Response: {
  "success": true,
  "message": "Payment verified successfully"
}
```

### **3. Webhook (Razorpay → Server)**
```
POST /api/payment/webhook
Headers: {
  "X-Razorpay-Signature": "signature"
}
```

---

## 🚀 Going Live (Production)

### **Step 1: Complete KYC**
- Submit business documents to Razorpay
- Wait for approval (usually 24-48 hours)

### **Step 2: Activate Live Mode**
1. In Razorpay Dashboard, switch to **Live Mode**
2. Generate **Live API Keys**
3. Update your `.env` files with live keys

### **Step 3: Update Frontend**
```env
REACT_APP_RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY
```

### **Step 4: Setup Webhooks**
1. Go to Razorpay Dashboard → **Webhooks**
2. Add your webhook URL:
   ```
   https://your-domain.com/api/payment/webhook
   ```
3. Select events:
   - ✅ payment.captured
   - ✅ payment.failed
   - ✅ order.paid
4. Copy the **Webhook Secret** and add to `.env`

### **Step 5: Test in Production**
- Do a real transaction with a small amount (₹1)
- Verify order status updates correctly
- Check payment appears in Razorpay Dashboard

---

## 💰 Transaction Fees

**Razorpay Charges:**
- Domestic Cards: 2% + GST
- International Cards: 3% + GST
- UPI: 0% (Free until certain volume)
- Netbanking: 2% + GST
- Wallets: 2% + GST

**Settlement Time:**
- T+3 days (3 working days after transaction)
- Instant settlement available (additional charges apply)

---

## 🐛 Troubleshooting

### **Payment Modal Not Opening:**
- Check if Razorpay script is loaded
- Verify `REACT_APP_RAZORPAY_KEY_ID` is set correctly
- Check browser console for errors

### **Payment Success but Order Not Updating:**
- Check webhook signature verification
- Verify webhook URL is accessible
- Check backend logs for errors

### **"Invalid Key" Error:**
- Ensure you're using Test keys in test mode
- Check `.env` file is loaded correctly
- Restart backend after updating keys

### **Payment Amount Mismatch:**
- Remember: Amount must be in **paise** (multiply by 100)
- Example: ₹500 = 50000 paise

---

## 📱 Mobile App Integration

When building React Native apps, you'll need:
```bash
npm install react-native-razorpay
```

The same backend endpoints work for mobile apps!

---

## ✅ Checklist Before Going Live

- [ ] KYC completed and approved
- [ ] Live API keys generated
- [ ] Webhook configured with live URL
- [ ] Test transaction completed successfully
- [ ] Settlement account verified
- [ ] Terms & Conditions updated with payment policy
- [ ] Refund policy documented
- [ ] Customer support email/phone added

---

## 📞 Support

**Razorpay Support:**
- Email: support@razorpay.com
- Phone: +91-80-4899-8999
- Dashboard: [https://dashboard.razorpay.com/](https://dashboard.razorpay.com/)

**Documentation:**
- [Razorpay API Docs](https://razorpay.com/docs/api/)
- [Payment Gateway Integration](https://razorpay.com/docs/payments/)
- [Webhooks Guide](https://razorpay.com/docs/webhooks/)

---

## 🎉 You're All Set!

Once you add your API keys and restart the services, payments will work automatically! 

Test the flow:
1. Add items to cart
2. Go to checkout
3. Click "Pay Now"
4. Use test card: `4111 1111 1111 1111`
5. Complete payment
6. See order status change to "Confirmed"

**Ready to accept payments! 💸**
