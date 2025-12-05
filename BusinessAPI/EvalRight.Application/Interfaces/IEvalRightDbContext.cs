using System.Threading;
using System.Threading.Tasks;
using EvalRight.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace EvalRight.Application.Interfaces;

public interface IEvalRightDbContext
{
    DbSet<Account> Accounts { get; }
    DbSet<Role> Roles { get; }
    DbSet<AccountRole> AccountRoles { get; }
    DbSet<Client> Clients { get; }
    DbSet<ClientBranch> ClientBranches { get; }
    DbSet<ClientContact> ClientContacts { get; }
    DbSet<ClientSettings> ClientSettings { get; }
    DbSet<BgvPackage> BgvPackages { get; }
    DbSet<Candidate> Candidates { get; }
    DbSet<BgvOrder> BgvOrders { get; }
    DbSet<BgvOrderComponent> BgvOrderComponents { get; }
    DbSet<BgvOrderEvent> BgvOrderEvents { get; }
    DbSet<CandidateInvitation> CandidateInvitations { get; }
    DbSet<CandidateDocumentRequirement> CandidateDocumentRequirements { get; }
    DbSet<CandidateProfileData> CandidateProfileData { get; }
    DbSet<IdaCase> IdaCases { get; }
    DbSet<Invoice> Invoices { get; }
    DbSet<InvoiceLineItem> InvoiceLineItems { get; }
    DbSet<InvoicePayment> InvoicePayments { get; }
    DbSet<BillingOrder> BillingOrders { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    DatabaseFacade Database { get; }
}

