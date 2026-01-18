# Deploying Sales App to Coolify

This guide details how to deploy the Sales App (React + Vite) to a Coolify instance.

## Prerequisites

- Access to your Coolify dashboard.
- A connected Git repository (GitHub/GitLab) containing this project.
- The project pushed to the repository.
- **Strapi backend deployed and configured** with proper database schema.

## Backend Database Schema Requirements

**IMPORTANT:** Your Strapi backend database must have the correct schema for Create SPK to work:

```sql
-- components_spk_section_units table
ALTER TABLE "public"."components_spk_section_units"
ALTER COLUMN "harga_otr" TYPE NUMERIC(15, 2),  -- Must handle values up to 999,999,999,999.99
ALTER COLUMN "tahun" TYPE VARCHAR(10);          -- Year as string (e.g., "2025")

-- components_spk_section_payments table
ALTER TABLE "public"."components_spk_section_payments"
ALTER COLUMN "tenor" TYPE VARCHAR(10);          -- Tenor as string (e.g., "60")
```

If you encounter "numeric field overflow" errors when creating SPK, run the above SQL on your Strapi database.

## Step-by-Step Deployment

### 1. Create New Resource
1.  Go to your Coolify Dashboard.
2.  Click **+ New Resource**.
3.  Select **Git Repository** (Public or Private).
4.  Choose your repository: `boristel/karuniafrontendsalesapp` (or your specific repo name).
5.  Select the branch (e.g., `main`).

### 2. Configuration Source
Coolify will attempt to auto-detect the project type.
- **Build Pack**: Select **Nixpacks** (Recommended) or **Static Web Website**.
    - Nixpacks usually handles Vite apps automatically.
    - If you choose *Static Web Website*, ensure to set the output directory to `dist`.

### 3. Build Settings
Verify the settings in the **Configuration** -> **Build** tab:

- **Build Command**: `npm run build`
- **Install Command**: `npm install`
- **Publish Directory**: `dist` (This is where Vite outputs the build)
- **Start Command**:
    - If you selected **Static Web Website**: *Leave this empty*.
    - If you selected **Nixpacks / Application**: `npm run preview -- --host`
- **Use a Build Server**: *Unchecked* (Ensure your local server is selected, unless you have a dedicated build cluster).


### 4. Environment Variables
You MUST set the following environment variables in the **Environment Variables** tab. These are critical for the app to function.

| Variable | Value (Example) | Description |
| :--- | :--- | :--- |
| `VITE_STRAPI_BASE_URL` | `https://api.yourdomain.com/api` | **CRITICAL**: The production URL of your Strapi Backend (must end with `/api`). |
| `VITE_STRAPI_URL` | `https://api.yourdomain.com` | **CRITICAL**: The root URL of your Strapi Backend (for media/images). |
| `VITE_STRAPI_TOKEN` | `your_long_api_token` | The API Token from Strapi (Read-Only or Custom). |
| `VITE_APP_VERSION` | `1.0.1` | The application version displayed in the footer. |
| `VITE_GOOGLE_MAPS_API_KEY` | `AIzaSy...` | Your Google Maps API Key. |
| `VITE_QR_BASE_URL` | `https://app.yourdomain.com/profile/` | The base URL for the Profile QR Code. **Must end with `/`**. |

> **Important**: Ensure all URLs are public HTTPS URLs for production.

### 5. Domains
1.  Go to the **General** tab.
2.  Set your **Domain** (e.g., `https://sales.karuniamotor.com`).
3.  Coolify will handle the SSL certificate generation automatically.

### 6. Deployment
1.  Click **Deploy** in the top right corner.
2.  Watch the logs.
3.  Once the "Deployment Successful" message appears, click your domain to test the app.

## Troubleshooting

- **404 on Refresh**: Since this is a Single Page App (SPA), refreshing pages like `/home` or `/dashboard` might cause a 404 if the server isn't configured for SPA fallback.
    - **Fix in Coolify (Nixpacks/Static)**: Usually handled automatically. If using a custom Nginx config, ensure `try_files $uri /index.html;` is present.
- **API Errors**: Check the browser console. If you see CORS errors or connection refused, check your `VITE_STRAPI_BASE_URL`.
- **502 Bad Gateway**: This means Coolify cannot connect to your app.
    - **Cause 1**: Wrong Port. Your app is configured to use port **5555** in `vite.config.ts`.
        - **Fix**: In **Settings** -> **General** -> **Ports Exposes**, you MUST change it to `5555`.
    - **Cause 2**: Wrong Resource Type.
        - **Fix**: Switch **Build Pack** to **Static Web Website** in **Settings** (This is the most stable option).
- **White Screen**: Check the `Publish Directory`. It **must** be `dist`.

