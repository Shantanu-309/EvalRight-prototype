using EvalRight.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// DbContext
builder.Services.AddDbContext<EvalRightDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<EvalRight.Application.Interfaces.IEvalRightDbContext>(provider => 
    provider.GetRequiredService<EvalRightDbContext>());

// Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Set to true in prod
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

builder.Services.AddControllers();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Register Application Services
builder.Services.AddScoped<EvalRight.Application.Interfaces.IAuthService, EvalRight.Application.Services.AuthService>();
builder.Services.AddScoped<EvalRight.Application.Interfaces.IClientService, EvalRight.Application.Services.ClientService>();
builder.Services.AddScoped<EvalRight.Application.Interfaces.IOrderService, EvalRight.Application.Services.OrderService>();
builder.Services.AddScoped<EvalRight.Application.Interfaces.ICandidatePortalService, EvalRight.Application.Services.CandidatePortalService>();
builder.Services.AddScoped<EvalRight.Application.Interfaces.IAdminService, EvalRight.Application.Services.AdminService>();
builder.Services.AddHttpClient<EvalRight.Application.Interfaces.IIdaClient, EvalRight.Infrastructure.ExternalServices.IdaClient>();
// builder.Services.AddSingleton<EvalRight.Application.Interfaces.IIdaClient, EvalRight.Infrastructure.ExternalServices.MockIdaClient>(); // Replaced with Real Client
builder.Services.AddScoped<EvalRight.Application.Interfaces.IVendorService, EvalRight.Application.Services.VendorService>();
builder.Services.AddScoped<EvalRight.Application.Interfaces.IBillingService, EvalRight.Application.Services.BillingService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
