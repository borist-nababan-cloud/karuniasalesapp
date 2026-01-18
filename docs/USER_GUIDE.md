# Karunia Motor Sales Applications - User Guide

## Table of Contents
1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Features](#features)
4. [How to Use Each Feature](#how-to-use-each-feature)
5. [Troubleshooting](#troubleshooting)
6. [FAQ](#faq)

---

## Overview

The Karunia Motor Sales Applications is a web-based Customer Relationship Management (CRM) system designed for sales personnel to manage:

- **SPK (Surat Pemesanan Kendaraan)** - Vehicle Sales Orders
- **Customer Attendance** - Geolocation-based check-in/check-out
- **Sales Profiles** - Manage sales representative information
- **Dashboard** - Overview of sales activities

### Tech Stack
- **Frontend**: React 19.2 + TypeScript + Vite
- **Backend**: Strapi v5 CMS
- **Database**: PostgreSQL
- **Deployment**: Docker + Nginx + Coolify

---

## Getting Started

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Active internet connection
- Valid user credentials (email and password)

### Accessing the Application
1. Navigate to your deployment URL (e.g., `https://sales.karuniamotor.com`)
2. Enter your email and password
3. Click **Login**

### First-Time Login
- Your account must be **approved** by an administrator before accessing the system
- If you see "Account not approved" message, contact your administrator

---

## Features

### 1. Authentication
- **Login**: Secure access with email/password
- **Registration**: New users can register (requires admin approval)
- **Profile Management**: Update personal information and view QR code

### 2. Dashboard
- Overview of sales activities
- Quick navigation to all features
- Recent SPK entries display

### 3. SPK Management (Surat Pemesanan Kendaraan)
- **Create SPK**: Generate new vehicle sales orders
- **Edit SPK**: Modify existing orders
- **View SPK List**: Browse all sales orders
- **Generate PDF**: Download SPK as PDF document

### 4. Attendance System
- **Check In**: Record attendance with GPS location
- **Check Out**: End work day with GPS location
- **View History**: Track attendance records

### 5. Profile Management
- Update personal information
- View your unique QR code
- Change password

---

## How to Use Each Feature

### Creating an SPK (Sales Order)

#### Step 1: Access Create SPK Form
1. From the Dashboard, click **"Create SPK"** in the sidebar
2. Or navigate to `/spk/create`

#### Step 2: Fill Customer Information
- **Nama Customer**: Customer's full name (required)
- **Pekerjaan Customer**: Customer's occupation
- **Email Customer**: Customer's email address (required)
- **Nama Debitur**: Name of the person financing the purchase
- **Alamat Customer**: Customer's address (required)
- **Kota Customer**: City of residence (required)
- **No Telepon**: Phone number (required)

#### Step 3: Fill Document Information
- **Nama BPKP/STNK**: Name for vehicle registration
- **Alamat BPKP/STNK**: Address for vehicle registration
- **Kota STNK/BPKB**: City for vehicle registration

#### Step 4: Upload Required Documents
Upload the following images:
- **KTP (Identity Card)**: Customer's ID card (required)
- **Kartu Keluarga (Family Card)**: Family card (required)
- **Selfie**: Customer's photo (required)

> **Note**: Supported formats: JPG, PNG. Maximum file size: 5MB per image.

#### Step 5: Select Vehicle Information
- **Vehicle Type**: Select from available vehicles dropdown
- **Harga OTR**: On-the-Road price (auto-filled based on vehicle type)
- **No Mesin**: Engine number (optional)
- **No Rangka**: Chassis number (optional)
- **Color**: Select from available colors dropdown
- **Tahun**: Vehicle year (e.g., 2025)
- **Bonus**: Additional items included
- **Lain-lain**: Other notes

#### Step 6: Fill Payment Information
- **Cara Bayar**: Payment method (CASH/KREDIT)
- **Angsuran**: Monthly installment amount (if credit)
- **Tanda Jadi**: Down payment / booking fee
- **Tenor**: Credit tenure in months (e.g., 60 for 5 years)
- **Nama Leasing**: Leasing company name (if credit)
- **DP (Down Payment)**: Initial payment amount
- **Pembelian Via**: Purchase channel/referral
- **Keterangan**: Additional payment notes

#### Step 7: Submit
- Click **"Create SPK"** button
- Wait for confirmation message
- SPK is saved and can be viewed in the SPK list

---

### Attendance (Check-In/Check-Out)

#### How to Check In
1. Navigate to **Attendance** from sidebar
2. Click **"Check In"** button
3. Grant location permission when prompted
4. Wait for GPS location capture
5. Confirm your attendance

#### How to Check Out
1. Navigate to **Attendance** from sidebar
2. Click **"Check Out"** button
3. Grant location permission when prompted
4. Wait for GPS location capture
5. Confirm your attendance

> **Important**: Enable location services in your browser for attendance tracking to work.

---

### Profile Management

#### View Your Profile
1. Click your name in the top right corner
2. Select **"Profile"** from the dropdown

#### Update Information
1. Edit the fields you want to change
2. Click **"Save Changes"**

#### View Your QR Code
- Your unique QR code is displayed on your profile page
- This QR code identifies you in the system
- Can be used for verification purposes

---

### Viewing SPK List

1. Navigate to **SPK** from sidebar
2. View all sales orders in table format
3. Each row shows:
   - SPK Number
   - Customer Name
   - Vehicle Type
   - Date
   - Status

### Editing an SPK

1. From SPK list, click on the SPK you want to edit
2. Modify the desired fields
3. Click **"Update SPK"** button
4. Wait for confirmation

---

## Troubleshooting

### Common Issues

#### 1. "Account not approved" message
**Solution**: Contact your administrator to approve your account.

#### 2. Cannot upload images
**Solutions**:
- Check file size (max 5MB)
- Ensure file format is JPG or PNG
- Check internet connection
- Try clearing browser cache

#### 3. GPS location not working
**Solutions**:
- Enable location services in browser
- Check browser permissions
- Ensure you're using HTTPS (required for geolocation)
- Try a different browser

#### 4. "Error 500" when creating SPK
**Solutions**:
- Check all required fields are filled
- Ensure images are properly uploaded
- Contact technical support if issue persists

#### 5. Application won't load
**Solutions**:
- Clear browser cache and cookies
- Check internet connection
- Try a different browser
- Contact technical support

---

## FAQ

### Q: What is SPK?
**A**: SPK stands for "Surat Pemesanan Kendaraan" (Vehicle Sales Order). It's a formal document used to record vehicle sales transactions.

### Q: Can I delete an SPK after creating it?
**A**: No, SPKs cannot be deleted to maintain audit trail. Contact administrator for corrections.

### Q: What if I forget my password?
**A**: Click "Forgot Password" on login page and follow the instructions to reset your password.

### Q: Can I access the application on mobile?
**A**: Yes, the application is responsive and works on mobile devices.

### Q: How do I know my attendance was recorded?
**A**: After check-in/check-out, you'll see a confirmation message and can view your attendance history.

### Q: What happens if I don't check out?
**A**: Your attendance will show as incomplete. Always remember to check out at end of day.

### Q: Can I edit my profile information?
**A**: Yes, you can update most of your profile information from the Profile page.

### Q: Is my data secure?
**A**: Yes, all data is encrypted and transmitted over HTTPS. We follow industry-standard security practices.

---

## System Administrator Notes

### Database Schema Requirements
For the Create SPK feature to work correctly, ensure your Strapi PostgreSQL database has the following schema:

```sql
-- components_spk_section_units table
ALTER TABLE "public"."components_spk_section_units"
ALTER COLUMN "harga_otr" TYPE NUMERIC(15, 2),  -- Handles values up to 999,999,999,999.99
ALTER COLUMN "tahun" TYPE VARCHAR(10);          -- Year as string (e.g., "2025")

-- components_spk_section_payments table
ALTER TABLE "public"."components_spk_section_payments"
ALTER COLUMN "tenor" TYPE VARCHAR(10);          -- Tenor as string (e.g., "60")
```

### Environment Variables Required
```
VITE_STRAPI_BASE_URL     - Strapi API endpoint
VITE_STRAPI_URL          - Strapi base URL for media
VITE_STRAPI_TOKEN        - Strapi API token (optional)
VITE_QR_BASE_URL         - Base URL for QR code generation
VITE_APP_VERSION         - Application version
VITE_GOOGLE_MAPS_API_KEY - Google Maps API key (optional)
```

---

## Support

For technical support or questions:
- **Email**: borist@nababancloyd.net
- **Phone**: 0821-888-000-71
- **Office Hours**: Monday - Friday, 9:00 AM - 11:00 PM

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.1 | 2025-12-23 | Production release with database schema fixes |
| 1.0.0 | 2025-12-20 | Initial release |

---

*Document Last Updated: December 23, 2025*
