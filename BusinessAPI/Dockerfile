FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["EvalRight.API/EvalRight.API.csproj", "EvalRight.API/"]
COPY ["EvalRight.Application/EvalRight.Application.csproj", "EvalRight.Application/"]
COPY ["EvalRight.Domain/EvalRight.Domain.csproj", "EvalRight.Domain/"]
COPY ["EvalRight.Infrastructure/EvalRight.Infrastructure.csproj", "EvalRight.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "EvalRight.API/EvalRight.API.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/EvalRight.API"
RUN dotnet build "EvalRight.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "EvalRight.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 5274
ENTRYPOINT ["dotnet", "EvalRight.API.dll"]





















