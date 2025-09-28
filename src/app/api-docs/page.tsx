'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import 'swagger-ui-react/swagger-ui.css'

// Dynamically import SwaggerUI with no SSR and suppress warnings
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading Swagger UI...</p>
      </div>
    </div>
  )
})

export default function ApiDocsPage() {
  const [spec, setSpec] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentEnv, setCurrentEnv] = useState<string>('')

  useEffect(() => {
    // Detect environment
    const isProduction = window.location.hostname !== 'localhost'
    setCurrentEnv(isProduction ? 'production' : 'development')

    // Suppress React warnings for third-party components in development
    if (!isProduction) {
      const originalConsoleError = console.error
      console.error = (...args) => {
        if (
          typeof args[0] === 'string' &&
          (args[0].includes('UNSAFE_componentWillReceiveProps') ||
           args[0].includes('ModelCollapse') ||
           args[0].includes('OperationContainer'))
        ) {
          return
        }
        originalConsoleError(...args)
      }

      // Cleanup on unmount
      return () => {
        console.error = originalConsoleError
      }
    }

    fetch('/swagger.json')
      .then(response => response.json())
      .then(data => {
        setSpec(data)
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Failed to load OpenAPI spec:', error)
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading API documentation...</p>
        </div>
      </div>
    )
  }

  if (!spec) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Failed to load API documentation</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Full API Documentation</h1>
          <p className="text-gray-600 mb-4">
            {currentEnv === 'production' 
              ? 'Production API documentation (read-only)' 
              : 'Interactive API documentation with live testing'}
          </p>
          
          {/* Environment Info */}
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            currentEnv === 'production'
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              currentEnv === 'production' ? 'bg-green-600' : 'bg-blue-600'
            }`}></div>
            {currentEnv.charAt(0).toUpperCase() + currentEnv.slice(1)} Environment
          </div>

          {currentEnv === 'production' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> API testing is disabled in production due to CORS and authentication limitations.
                For interactive testing, please run the application locally.
              </p>
            </div>
          )}
        </div>
        
        {/* Custom CSS to improve SwaggerUI appearance */}
        <style jsx global>{`
          .swagger-ui .topbar { display: none; }
          .swagger-ui .info { margin: 20px 0; }
          .swagger-ui .scheme-container { background: #fafafa; padding: 10px; border-radius: 4px; }
          .swagger-ui .opblock.opblock-post { border-color: #49cc90; background: rgba(73, 204, 144, 0.1); }
          .swagger-ui .opblock.opblock-get { border-color: #61affe; background: rgba(97, 175, 254, 0.1); }
          .swagger-ui .opblock.opblock-put { border-color: #fca130; background: rgba(252, 161, 48, 0.1); }
          .swagger-ui .opblock.opblock-delete { border-color: #f93e3e; background: rgba(249, 62, 62, 0.1); }
          .swagger-ui .opblock.opblock-patch { border-color: #50e3c2; background: rgba(80, 227, 194, 0.1); }
          .swagger-ui .btn.try-out__btn { background: #4990e2; color: white; border: none; }
          .swagger-ui .btn.execute { background: #4990e2; color: white; border: none; }
          .swagger-ui .btn.try-out__btn:hover, .swagger-ui .btn.execute:hover { background: #357abd; }
        `}</style>
        
        <SwaggerUI 
          spec={spec} 
          deepLinking={true}
          displayRequestDuration={true}
          defaultModelsExpandDepth={2}
          defaultModelExpandDepth={2}
          tryItOutEnabled={currentEnv !== 'production'}
          supportedSubmitMethods={currentEnv === 'production' ? [] : ['get', 'post', 'put', 'delete', 'patch']}
          requestInterceptor={(request: any) => {
            // Add any common headers or authentication
            if (currentEnv !== 'production') {
              request.headers['Content-Type'] = 'application/json';
            }
            return request;
          }}
          responseInterceptor={(response: any) => {
            return response;
          }}
          onComplete={(swaggerApi: any) => {
            console.log(`SwaggerUI loaded successfully in ${currentEnv} mode`);
          }}
          plugins={[]}
          layout="BaseLayout"
          docExpansion="list"
          filter={true}
          showExtensions={true}
          showCommonExtensions={true}
          persistAuthorization={currentEnv !== 'production'}
          withCredentials={currentEnv !== 'production'}
        />
      </div>
    </div>
  )
}