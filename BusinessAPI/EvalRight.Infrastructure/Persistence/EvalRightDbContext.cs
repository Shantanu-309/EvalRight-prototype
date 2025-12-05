using EvalRight.Application.Interfaces;
using EvalRight.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EvalRight.Infrastructure.Persistence;

public class EvalRightDbContext : DbContext, IEvalRightDbContext
{
    public EvalRightDbContext(DbContextOptions<EvalRightDbContext> options) : base(options)
    {
    }

    public DbSet<Account> Accounts { get; set; }
    public DbSet<UserProfile> UserProfiles { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<AccountRole> AccountRoles { get; set; }
    public DbSet<AuthSession> AuthSessions { get; set; }
    
    public DbSet<ClientGroup> ClientGroups { get; set; }
    public DbSet<Client> Clients { get; set; }
    public DbSet<ClientBranch> ClientBranches { get; set; }
    public DbSet<ClientContact> ClientContacts { get; set; }
    public DbSet<ClientSettings> ClientSettings { get; set; }
    public DbSet<ClientRegistrationForm> ClientRegistrationForms { get; set; }
    public DbSet<ClientPackageOverride> ClientPackageOverrides { get; set; }
    
    public DbSet<Candidate> Candidates { get; set; }
    public DbSet<CandidateInvitation> CandidateInvitations { get; set; }
    public DbSet<CandidateTaskStatus> CandidateTaskStatuses { get; set; }
    public DbSet<CandidateProfileData> CandidateProfileData { get; set; }
    public DbSet<CandidateAddress> CandidateAddresses { get; set; }
    public DbSet<CandidateEmployment> CandidateEmployments { get; set; }
    public DbSet<CandidateEducation> CandidateEducations { get; set; }
    
    public DbSet<BgvComponentsCatalog> BgvComponentsCatalog { get; set; }
    public DbSet<BgvPackage> BgvPackages { get; set; }
    public DbSet<BgvPackageComponent> BgvPackageComponents { get; set; }
    public DbSet<DocumentRequirement> DocumentRequirements { get; set; }
    
    public DbSet<BgvOrder> BgvOrders { get; set; }
    public DbSet<BgvOrderComponent> BgvOrderComponents { get; set; }
    public DbSet<BgvOrderEvent> BgvOrderEvents { get; set; }
    public DbSet<CandidateDocumentRequirement> CandidateDocumentRequirements { get; set; }
    
    public DbSet<CandidateDocument> CandidateDocuments { get; set; }
    public DbSet<IdaJobRole> IdaJobRoles { get; set; }
    public DbSet<IdaCase> IdaCases { get; set; }
    public DbSet<IdaCaseComponent> IdaCaseComponents { get; set; }
    
    public DbSet<BillingCustomer> BillingCustomers { get; set; }
    public DbSet<BillingPaymentMethod> BillingPaymentMethods { get; set; }
    public DbSet<BillingOrder> BillingOrders { get; set; }
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<InvoiceLineItem> InvoiceLineItems { get; set; }
    public DbSet<InvoicePayment> InvoicePayments { get; set; }
    public DbSet<ClientTransaction> ClientTransactions { get; set; }
    
    public DbSet<WebhookEvent> WebhookEvents { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<JobQueue> JobQueue { get; set; }
    public DbSet<CandidateTimelineEvent> CandidateTimelineEvents { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(EvalRightDbContext).Assembly);
        
        // Global conventions if any
        // e.g. SnakeCase naming convention is handled by Npgsql usually or we can configure it
    }
}

