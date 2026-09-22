using EvalRight.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Optional local secrets (gitignored) — overrides appsettings.json
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);

// ===============================
// SERVICES
// ===============================

// DbContext
builder.Services.AddDbContext<EvalRightDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection")
        ?? "Server=localhost;Database=evalright;User=root;Password=;",
        new MySqlServerVersion(new Version(8, 0, 21)),
        options => options.EnableRetryOnFailure()
    ),
    ServiceLifetime.Scoped
);

builder.Services.AddScoped<EvalRight.Application.Interfaces.IEvalRightDbContext>(provider =>
    provider.GetRequiredService<EvalRightDbContext>());

// -------------------------------
// AUTHENTICATION (JWT)
// -------------------------------
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // OK for dev
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"]
    };
});

builder.Services.AddAuthorization();

// -------------------------------
// CORS
// -------------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:3000"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// -------------------------------
// CONTROLLERS
// -------------------------------
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy =
            System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// -------------------------------
// 🔥 SWAGGER (THIS WAS MISSING)
// -------------------------------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// -------------------------------
// APPLICATION SERVICES
// -------------------------------
builder.Services.AddScoped<EvalRight.Application.Interfaces.IAuthService, EvalRight.Application.Services.AuthService>();
builder.Services.AddScoped<EvalRight.Application.Interfaces.IClientService, EvalRight.Application.Services.ClientService>();
builder.Services.AddScoped<EvalRight.Application.Interfaces.IOrderService, EvalRight.Application.Services.OrderService>();
builder.Services.AddScoped<EvalRight.Application.Interfaces.ICandidatePortalService, EvalRight.Application.Services.CandidatePortalService>();
builder.Services.AddScoped<EvalRight.Application.Interfaces.IAdminService, EvalRight.Application.Services.AdminService>();
builder.Services.AddScoped<EvalRight.Application.Interfaces.IDashboardService, EvalRight.Application.Services.DashboardService>();
builder.Services.AddScoped<EvalRight.Application.Interfaces.IEmailService, EvalRight.Application.Services.EmailService>();
builder.Services.AddScoped<EvalRight.Application.Interfaces.IInvitationService, EvalRight.Application.Services.InvitationService>();
builder.Services.AddHttpClient<EvalRight.Application.Interfaces.IIdaClient, EvalRight.Infrastructure.ExternalServices.IdaClient>();
builder.Services.AddScoped<EvalRight.Application.Interfaces.IVendorService, EvalRight.Application.Services.VendorService>();
builder.Services.AddScoped<EvalRight.Application.Interfaces.IBillingService, EvalRight.Application.Services.BillingService>();
builder.Services.AddScoped<EvalRight.Application.Interfaces.IClientApplicantService, EvalRight.Application.Services.ClientApplicantService>();
builder.Services.AddScoped<EvalRight.Application.Interfaces.IFileUploadService, EvalRight.Application.Services.FileUploadService>();

// ===============================
// APP
// ===============================
var app = builder.Build();

// -------------------------------
// 🔥 SWAGGER MIDDLEWARE
// -------------------------------
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "EvalRight API v1");
    c.RoutePrefix = "swagger"; // default
});

// -------------------------------
// PIPELINE
// -------------------------------
app.UseCors("AllowFrontend");

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
