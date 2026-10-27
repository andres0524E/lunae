/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as AuthenticatedRouteRouteImport } from './routes/_authenticated/route'
import { Route as AuthRouteImport } from './routes/auth'
import { Route as AuthenticatedAdminRouteImport } from './routes/_authenticated/admin'
import { Route as JoyaIdRouteImport } from './routes/joya.$id'

const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const AuthenticatedRouteRoute = AuthenticatedRouteRouteImport.update({
  id: '/_authenticated',
  getParentRoute: () => rootRouteImport,
} as any)
const AuthRoute = AuthRouteImport.update({
  id: '/auth',
  path: '/auth',
  getParentRoute: () => rootRouteImport,
} as any)
const AuthenticatedAdminRoute = AuthenticatedAdminRouteImport.update({
  id: '/admin',
  path: '/admin',
  getParentRoute: () => AuthenticatedRouteRoute,
} as any)
const JoyaIdRoute = JoyaIdRouteImport.update({
  id: '/joya/$id',
  path: '/joya/$id',
  getParentRoute: () => rootRouteImport,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/auth': typeof AuthRoute
  '/admin': typeof AuthenticatedAdminRoute
  '/joya/$id': typeof JoyaIdRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/auth': typeof AuthRoute
  '/admin': typeof AuthenticatedAdminRoute
  '/joya/$id': typeof JoyaIdRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/_authenticated': typeof AuthenticatedRouteRouteWithChildren
  '/auth': typeof AuthRoute
  '/_authenticated/admin': typeof AuthenticatedAdminRoute
  '/joya/$id': typeof JoyaIdRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/auth' | '/admin' | '/joya/$id'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/auth' | '/admin' | '/joya/$id'
  id:
    | '__root__'
    | '/'
    | '/_authenticated'
    | '/auth'
    | '/_authenticated/admin'
    | '/joya/$id'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AuthenticatedRouteRoute: typeof AuthenticatedRouteRouteWithChildren
  AuthRoute: typeof AuthRoute
  JoyaIdRoute: typeof JoyaIdRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/_authenticated': {
      id: '/_authenticated'
      path: ''
      fullPath: '/'
      preLoaderRoute: typeof AuthenticatedRouteRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/auth': {
      id: '/auth'
      path: '/auth'
      fullPath: '/auth'
      preLoaderRoute: typeof AuthRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/_authenticated/admin': {
      id: '/_authenticated/admin'
      path: '/admin'
      fullPath: '/admin'
      preLoaderRoute: typeof AuthenticatedAdminRouteImport
      parentRoute: typeof AuthenticatedRouteRoute
    }
    '/joya/$id': {
      id: '/joya/$id'
      path: '/joya/$id'
      fullPath: '/joya/$id'
      preLoaderRoute: typeof JoyaIdRouteImport
      parentRoute: typeof rootRouteImport
    }
  }
}

interface AuthenticatedRouteRouteChildren {
  AuthenticatedAdminRoute: typeof AuthenticatedAdminRoute
}

const AuthenticatedRouteRouteChildren: AuthenticatedRouteRouteChildren = {
  AuthenticatedAdminRoute: AuthenticatedAdminRoute,
}

const AuthenticatedRouteRouteWithChildren =
  AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren)

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AuthenticatedRouteRoute: AuthenticatedRouteRouteWithChildren,
  AuthRoute: AuthRoute,
  JoyaIdRoute: JoyaIdRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
