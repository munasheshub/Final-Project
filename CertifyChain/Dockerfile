# -----------------------------
# Build stage
# -----------------------------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy the project files
COPY CertifyChain.Api/CertifyChain.Api.csproj CertifyChain.Api/
COPY CertifyChain.Core/CertifyChain.Core.csproj CertifyChain.Core/
COPY CertifyChain.Data/CertifyChain.Data.csproj CertifyChain.Data/

# Restore dependencies
RUN dotnet restore CertifyChain.Api/CertifyChain.Api.csproj

# Copy the rest of the application code
COPY . .

# Build and publish the application
RUN dotnet publish CertifyChain.Api/CertifyChain.Api.csproj -c Release -o out

# -----------------------------
# Runtime stage
# -----------------------------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Copy the published output from build stage
COPY --from=build /app/out .

# Expose the port the app will run on
EXPOSE 80

# Start the application
ENTRYPOINT ["dotnet", "CertifyChain.Api.dll"]