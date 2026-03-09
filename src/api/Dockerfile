FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY SuspensionDesigner.sln .
COPY SuspensionDesigner.Core/SuspensionDesigner.Core.csproj SuspensionDesigner.Core/
COPY SuspensionDesigner.Application/SuspensionDesigner.Application.csproj SuspensionDesigner.Application/
COPY SuspensionDesigner.Infrastructure/SuspensionDesigner.Infrastructure.csproj SuspensionDesigner.Infrastructure/
COPY SuspensionDesigner.API/SuspensionDesigner.API.csproj SuspensionDesigner.API/
COPY SuspensionDesigner.Tests/SuspensionDesigner.Tests.csproj SuspensionDesigner.Tests/
RUN dotnet restore

COPY . .
RUN dotnet publish SuspensionDesigner.API/SuspensionDesigner.API.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "SuspensionDesigner.API.dll"]
