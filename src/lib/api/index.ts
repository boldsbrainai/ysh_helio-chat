/**
 * API Index
 * 
 * Central export point for all API endpoint handlers
 */

// ChatKit Endpoints
export {
  handleCreateSession,
  handleRefreshSession,
  handleWidgetAction,
} from './chatkit-endpoints'

export type {
  SessionRequest,
  SessionResponse,
  RefreshRequest,
  WidgetAction,
  WidgetActionRequest,
  WidgetActionResponse,
} from './chatkit-endpoints'
