using EvalRight.Domain.Entities;
using EvalRight.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EvalRight.Infrastructure.Persistence.Configurations;

public class CandidateConfiguration : IEntityTypeConfiguration<Candidate>
{
    public void Configure(EntityTypeBuilder<Candidate> builder)
    {
        builder.Property(x => x.Status).HasConversion<string>();
    }
}

public class CandidateInvitationConfiguration : IEntityTypeConfiguration<CandidateInvitation>
{
    public void Configure(EntityTypeBuilder<CandidateInvitation> builder)
    {
        builder.HasIndex(x => x.InvitationToken).IsUnique();
    }
}

public class CandidateTaskStatusConfiguration : IEntityTypeConfiguration<CandidateTaskStatus>
{
    public void Configure(EntityTypeBuilder<CandidateTaskStatus> builder)
    {
        builder.HasIndex(x => new { x.CandidateId, x.BgvOrderId, x.TaskCode }).IsUnique();
    }
}

public class CandidateProfileDataConfiguration : IEntityTypeConfiguration<CandidateProfileData>
{
    public void Configure(EntityTypeBuilder<CandidateProfileData> builder)
    {
        builder.HasIndex(x => new { x.CandidateId, x.TaskCode }).IsUnique();
    }
}

