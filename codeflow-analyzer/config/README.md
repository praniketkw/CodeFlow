# Repository Configuration

This directory contains configuration for multi-repository analysis.

## repos.json

Defines all repositories that CodeFlow should manage.

### Structure

```json
{
  "repositories": [
    {
      "name": "service-name",
      "url": "git-url",
      "type": "provider|consumer",
      "apis": [...],
      "dependencies": [...]
    }
  ],
  "scanPatterns": {
    "apiCalls": ["patterns"],
    "fileExtensions": [".js", ".ts"]
  }
}
```

### Repository Types

#### Provider
Services that expose APIs for others to consume.

```json
{
  "name": "auth-service",
  "url": "https://github.com/org/auth-service.git",
  "type": "provider",
  "apis": [
    {
      "endpoint": "/verify",
      "method": "GET",
      "description": "Verify authentication token"
    },
    {
      "endpoint": "/login",
      "method": "POST",
      "description": "User login"
    }
  ]
}
```

#### Consumer
Services that depend on other services' APIs.

```json
{
  "name": "user-service",
  "url": "https://github.com/org/user-service.git",
  "type": "consumer",
  "dependencies": [
    {
      "service": "auth-service",
      "endpoint": "/verify"
    }
  ]
}
```

### Scan Patterns

Customize what CodeFlow looks for when scanning code.

```json
{
  "scanPatterns": {
    "apiCalls": [
      "axios.get",
      "axios.post",
      "fetch\\(",
      "http.get",
      "request\\("
    ],
    "fileExtensions": [".js", ".ts", ".jsx", ".tsx"]
  }
}
```

**Note**: Patterns are regex, so escape special characters with `\\`.

## Examples

### Microservice Architecture

```json
{
  "repositories": [
    {
      "name": "auth-service",
      "url": "https://github.com/myorg/auth-service.git",
      "type": "provider",
      "apis": [
        { "endpoint": "/verify", "method": "GET", "description": "Verify token" },
        { "endpoint": "/login", "method": "POST", "description": "Login" }
      ]
    },
    {
      "name": "user-service",
      "url": "https://github.com/myorg/user-service.git",
      "type": "consumer",
      "dependencies": [
        { "service": "auth-service", "endpoint": "/verify" }
      ]
    },
    {
      "name": "order-service",
      "url": "https://github.com/myorg/order-service.git",
      "type": "consumer",
      "dependencies": [
        { "service": "auth-service", "endpoint": "/verify" }
      ]
    },
    {
      "name": "payment-service",
      "url": "https://github.com/myorg/payment-service.git",
      "type": "consumer",
      "dependencies": [
        { "service": "auth-service", "endpoint": "/verify" }
      ]
    }
  ]
}
```

### Local Testing

For testing with local repositories:

```json
{
  "repositories": [
    {
      "name": "auth-service",
      "url": "file:///Users/you/projects/auth-service",
      "type": "provider",
      "apis": [...]
    }
  ]
}
```

### Mixed Provider/Consumer

A service can be both:

```json
{
  "name": "user-service",
  "url": "https://github.com/myorg/user-service.git",
  "type": "provider",
  "apis": [
    { "endpoint": "/users", "method": "GET", "description": "Get users" }
  ],
  "dependencies": [
    { "service": "auth-service", "endpoint": "/verify" }
  ]
}
```

## Tips

1. **Start Small**: Begin with 2-3 repos to test
2. **Use Descriptive Names**: Match your actual service names
3. **Document APIs**: Add clear descriptions
4. **Keep Updated**: Update when adding new services
5. **Version Control**: Commit this file to track changes

## Validation

To validate your configuration:

```bash
npm run cross-repo
```

CodeFlow will report any issues with:
- Invalid URLs
- Missing dependencies
- Unreachable repositories

## Troubleshooting

### "Repository not found"
- Check the URL is correct
- Verify your GitHub token has access
- Try cloning manually: `git clone <url>`

### "No dependents found"
- Check endpoint names match exactly
- Verify dependencies are configured
- Ensure repos are synced

### "Scan found nothing"
- Check scan patterns match your code
- Verify file extensions are correct
- Look at actual code to see what patterns to use

## Advanced

### Custom Scan Patterns

For GraphQL:
```json
{
  "scanPatterns": {
    "apiCalls": [
      "gql`",
      "graphql\\(",
      "useQuery\\(",
      "useMutation\\("
    ]
  }
}
```

For REST clients:
```json
{
  "scanPatterns": {
    "apiCalls": [
      "RestClient\\.get",
      "HttpClient\\.post",
      "api\\.call"
    ]
  }
}
```

### Multiple Endpoints

```json
{
  "name": "api-gateway",
  "type": "provider",
  "apis": [
    { "endpoint": "/api/v1/users", "method": "GET" },
    { "endpoint": "/api/v1/users", "method": "POST" },
    { "endpoint": "/api/v1/users/:id", "method": "GET" },
    { "endpoint": "/api/v1/users/:id", "method": "PUT" },
    { "endpoint": "/api/v1/users/:id", "method": "DELETE" }
  ]
}
```

## Next Steps

1. Edit `repos.json` with your repositories
2. Run `npm run cross-repo` to test
3. Check the dashboard: `npm run dashboard`
4. Review the dependency graph

---

Need help? Check the main README.md for more information.
