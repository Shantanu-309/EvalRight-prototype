# Email Configuration Setup Guide

## Gmail SMTP Configuration

To enable email sending for invitations, you need to configure Gmail SMTP in `appsettings.json`.

### Step 1: Generate Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable it if not already enabled)
3. Scroll down to **App passwords**
4. Select **Mail** and **Other (Custom name)** → Enter "EvalRight"
5. Click **Generate**
6. Copy the 16-character App Password (you'll need this)

**Important:** Use the App Password, NOT your regular Gmail password.

### Step 2: Update appsettings.json

Open `BusinessAPI/EvalRight.API/appsettings.json` and update the Email section:

```json
"Email": {
  "SmtpHost": "smtp.gmail.com",
  "SmtpPort": "587",
  "SmtpUsername": "your-email@gmail.com",
  "SmtpPassword": "your-16-char-app-password",
  "FromEmail": "your-email@gmail.com",
  "FromName": "EvalRight"
}
```

Replace:
- `your-email@gmail.com` with your actual Gmail address
- `your-16-char-app-password` with the App Password you generated

### Step 3: Verify Configuration

After updating `appsettings.json`:
1. Restart the backend API
2. Try sending an invitation
3. Check the logs for email sending status

### Troubleshooting

**Error: "SMTP credentials are not configured"**
- Make sure `SmtpUsername` and `SmtpPassword` are filled in
- Restart the API after changing appsettings.json

**Error: "Authentication failed"**
- Verify you're using the App Password, not your regular password
- Make sure 2-Step Verification is enabled on your Google Account
- Check that the App Password was generated correctly

**Error: "Connection timeout"**
- Check your internet connection
- Verify firewall isn't blocking port 587
- Try using port 465 with SSL (requires code change)

### Security Note

- Never commit `appsettings.json` with real credentials to version control
- Use environment variables or User Secrets for production
- The `.gitignore` should exclude `appsettings.json` or use `appsettings.Development.json`












