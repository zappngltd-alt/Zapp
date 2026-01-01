# Swift System Architecture

This document provides a high-level overview of the Swift mobile application architecture, backend infrastructure, and core data flows.

## High-Level Overview

The system is built on a modern mobile-cloud architecture, leveraging React Native for the frontend and Google Firebase for the backend.

![System Architecture Diagram](/C:/Users/Rasheed/.gemini/antigravity/brain/96641eef-bf78-48f4-af7a-0356bce356ec/system_architecture_diagram_1767261731913.png)

```mermaid
graph TD
    subgraph "Client Side (Mobile App)"
        RN["React Native (Expo)"]
        NM["Native Android Module (Data Usage)"]
        FS_SDK["Firebase SDK (Auth, Firestore, Func)"]
        UI["UI (Components, Screens)"]
    end

    subgraph "Cloud Layer (Firebase)"
        Auth["Firebase Auth"]
        DB[("Cloud Firestore")]
        CF["Cloud Functions (v2)"]
    end

    subgraph "External Integrations"
        PS["Paystack API"]
        VEND["Vending API (Service Delivery)"]
    end

    RN --> UI
    RN --> NM
    RN --> FS_SDK
    FS_SDK --> Auth
    FS_SDK --> DB
    FS_SDK --> CF

    CF --> PS
    CF --> VEND
    PS -- "Webhook" --> CF
    DB -- "Trigger" --> CF
```

## Core Components

### 1. Mobile Application
- **Framework**: React Native with Expo (Dev Client).
- **State & Services**: Managed via React Contexts and dedicated service classes (e.g., [firebase.ts](file:///c:/Users/Rasheed/Desktop/UI%20Design%20(5)/rn/src/services/firebase.ts)).
- **Native Modules**: Custom Android module for data usage monitoring.
- **Internationalization**: Multi-language support using `i18next`.

### 2. Backend (Firebase)
- **Authentication**: Supports anonymous and verified sign-ins.
- **Cloud Functions**: Modularized v2 functions handling payments, vending, and business logic.
- **Firestore**: Real-time NoSQL database for transactions, user profiles, and product catalogs.

## Key Data Flow: Payment & Vending

The diagram below illustrates the sequence of events from payment initialization to service delivery.

```mermaid
sequenceDiagram
    participant User
    participant App as Mobile App
    participant CF as Cloud Functions
    participant FS as Cloud Firestore
    participant PS as Paystack
    participant V as Vending API

    User->>App: Clicks Buy Data/Airtime
    App->>CF: initPayment(details)
    CF->>PS: Create Transaction
    PS-->>CF: Authorization URL
    CF-->>App: Return Payment URL
    App->>User: Launch WebView
    User->>PS: Complete Payment
    PS-->>CF: Webhook (event: success)
    
    Note over CF, FS: Update Status to 'PAID'
    CF->>FS: doc('transactions/id').update({status: 'PAID'})
    
    Note right of FS: Trigger: onTransactionPaid
    FS->>CF: onTransactionPaid(doc)
    CF->>V: handleVending(details)
    V-->>CF: Vending Success
    CF->>FS: doc('transactions/id').update({status: 'COMPLETED'})
    FS-->>App: Real-time Listener Update
    App->>User: Show Success Receipt
```

## Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React Native, TypeScript, Expo |
| **Backend** | Node.js, Firebase (Functions, Firestore, Auth) |
| **Payments** | Paystack |
| **Styling** | Vanilla CSS (RN Stylesheet) |
| **Diagnostics** | Firebase Emulators (Local Development) |
