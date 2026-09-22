# MySQL Setup Guide for EvalRight

## Step 1: Get Your MySQL Root Password

If you don't know your MySQL root password, you have two options:

### Option A: Use MySQL Workbench
1. Open MySQL Workbench
2. Try to connect with root user
3. If it connects without password, your password is empty (blank)
4. If it asks for password, use the password you set during installation

### Option B: Reset MySQL Root Password (if forgotten)
1. Stop MySQL service: `net stop MySQL80`
2. Start MySQL in safe mode: `mysqld --skip-grant-tables`
3. Connect: `mysql -u root`
4. Run: `ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_new_password';`
5. Restart MySQL service normally

## Step 2: Create the Database

### Using MySQL Workbench (Easiest):
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Click on "Create a new schema" (or right-click in Schemas panel)
4. Name it: `evalright`
5. Click "Apply"

### Using Command Line:
```powershell
# Find MySQL installation path (usually one of these):
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "CREATE DATABASE evalright;"
```

## Step 3: Update Connection String

Edit `EvalRight.API/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=evalright;User=root;Password=YOUR_PASSWORD_HERE;"
}
```

**Replace `YOUR_PASSWORD_HERE` with your actual MySQL root password.**
**If your password is empty, leave it as `Password=;`**

## Step 4: Create Database Tables (EF Migrations)

Run these commands in PowerShell from `BusinessAPI/EvalRight.API` directory:

```powershell
# Create initial migration
dotnet ef migrations add InitialCreate --project ../EvalRight.Infrastructure --startup-project .

# Apply migration to create tables
dotnet ef database update --project ../EvalRight.Infrastructure --startup-project .
```

## Step 5: Verify Connection

Start your API:
```powershell
dotnet run
```

If it starts without database errors, you're connected! ✅

## Troubleshooting

### Error: "Access denied for user 'root'@'localhost'"
- **Solution**: Check your password in `appsettings.json`

### Error: "Unknown database 'evalright'"
- **Solution**: Create the database first (Step 2)

### Error: "dotnet ef command not found"
- **Solution**: Install EF tools: `dotnet tool install --global dotnet-ef`

### Error: "Can't connect to MySQL server"
- **Solution**: Make sure MySQL service is running: `Get-Service MySQL80`




















