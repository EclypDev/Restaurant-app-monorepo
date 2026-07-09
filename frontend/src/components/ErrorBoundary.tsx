import React, { Component, ErrorInfo, ReactNode } from 'react'
import { IErrorBoundaryProps } from '@shared'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<IErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: IErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8f9fa',
          padding: '20px',
          textAlign: 'center',
        }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>⚠️</h1>
          <h2>Algo salió mal</h2>
          <p style={{ color: '#6c757d', marginBottom: '20px' }}>
            {this.state.error?.message || 'Error inesperado'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
            style={{
              padding: '12px 24px',
              background: '#ff6b35',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Reintentar
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
