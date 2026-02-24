# -----------------------------
# Build stage
# -----------------------------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy the project files (relative paths)
COPY ./CertifyChain.Api/CertifyChain.Api.csproj CertifyChain.Api/
COPY ./CertifyChain.Core/CertifyChain.Core.csproj CertifyChain.Core/
COPY ./CertifyChain.Data/CertifyChain.Data.csproj CertifyChain.Data/

# Restore dependencies
RUN dotnet restore CertifyChain.Api/CertifyChain.Api.csproj

# Copy the rest of the code
COPY . .

# Build and publish
RUN dotnet publish CertifyChain.Api/CertifyChain.Api.csproj -c Release -o out

# -----------------------------
# Runtime stage
# -----------------------------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=build /app/out .

EXPOSE 80
ENTRYPOINT ["dotnet", "CertifyChain.Api.dll"]