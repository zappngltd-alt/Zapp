# Zapp

**Zapp** is a comprehensive Super App designed to simplify your daily payments and digital life. Built with React Native and Expo, and powered by a robust Firebase backend, Zapp offers a seamless, secure, and offline-first experience for managing Airtime, Data, TV subscriptions, Electricity bills, and USSD interactions.

<img src="./assets/banner.png" alt="Zapp Banner" width="100%" />

## 🚀 Key Features

*   **Virtual Top-Up (VTU)**: Instantly purchase cheap Data and Airtime for all major networks (MTN, Airtel, Glo, 9mobile).
*   **Bill Payments**: Pay your Electricity bills (Prepaid/Postpaid) and buy TV Subscriptions (DSTV, GOTV, Startimes) with zero hassle.
*   **USSD Offline Mode**: A powerful dialer that works without internet access, giving you one-tap access to bank transfers, data purchases, and emergency codes.
*   **Smart History**: Automatically tracks your transaction history for easy reference and re-purchasing.
*   **Biometric Security**: Protect your wallet and sensitive data with Face ID and Fingerprint lock.
*   **Favorites**: Pin your most frequently used services for lightning-fast access.

## 🛠️ Technology Stack

*   **Frontend**: React Native (Expo SDK 51)
*   **Backend**: Firebase (Cloud Functions, Firestore, Authentication)
*   **Vending Engine**: Integrated with VTPass & ClubKonnect APIs
*   **State Management**: React Context API
*   **Styling**: Custom Design System (No external UI libraries for core components)

## 📦 Installation

To run Zapp locally, ensure you have **Node.js** installed.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/zappngltd-alt/Zapp.git
    cd Zapp
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # OR
    yarn install
    ```

3.  **Setup Environment Variables:**
    Create a `.env` file in the root for Cloud Functions (if deploying backend) or check `app.json` for client-side configs.

4.  **Run the App:**
    ```bash
    npx expo run:android
    # OR
    npx expo run:ios
    ```

## 🔐 Security

Zapp prioritizes security with:
*   Secure token management via Firebase Auth.
*   Backend verification for all payment transactions.
*   Biometric App Lock.
*   Encrypted local storage for sensitive preferences.

## 🤝 Contributing

We welcome contributions! Please fork the repository and submit a Pull Request.

---

**© 2026 Zapp Technologies LTD.**
