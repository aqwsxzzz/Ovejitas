/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as IndexImport } from './routes/index'
import { Route as PublicLayoutImport } from './routes/_public/_layout'
import { Route as PublicLayoutSignupImport } from './routes/_public/_layout/signup'
import { Route as PublicLayoutLoginImport } from './routes/_public/_layout/login'

// Create/Update Routes

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const PublicLayoutRoute = PublicLayoutImport.update({
  id: '/_public/_layout',
  getParentRoute: () => rootRoute,
} as any)

const PublicLayoutSignupRoute = PublicLayoutSignupImport.update({
  id: '/signup',
  path: '/signup',
  getParentRoute: () => PublicLayoutRoute,
} as any)

const PublicLayoutLoginRoute = PublicLayoutLoginImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => PublicLayoutRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/_public/_layout': {
      id: '/_public/_layout'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof PublicLayoutImport
      parentRoute: typeof rootRoute
    }
    '/_public/_layout/login': {
      id: '/_public/_layout/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof PublicLayoutLoginImport
      parentRoute: typeof PublicLayoutImport
    }
    '/_public/_layout/signup': {
      id: '/_public/_layout/signup'
      path: '/signup'
      fullPath: '/signup'
      preLoaderRoute: typeof PublicLayoutSignupImport
      parentRoute: typeof PublicLayoutImport
    }
  }
}

// Create and export the route tree

interface PublicLayoutRouteChildren {
  PublicLayoutLoginRoute: typeof PublicLayoutLoginRoute
  PublicLayoutSignupRoute: typeof PublicLayoutSignupRoute
}

const PublicLayoutRouteChildren: PublicLayoutRouteChildren = {
  PublicLayoutLoginRoute: PublicLayoutLoginRoute,
  PublicLayoutSignupRoute: PublicLayoutSignupRoute,
}

const PublicLayoutRouteWithChildren = PublicLayoutRoute._addFileChildren(
  PublicLayoutRouteChildren,
)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '': typeof PublicLayoutRouteWithChildren
  '/login': typeof PublicLayoutLoginRoute
  '/signup': typeof PublicLayoutSignupRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '': typeof PublicLayoutRouteWithChildren
  '/login': typeof PublicLayoutLoginRoute
  '/signup': typeof PublicLayoutSignupRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/_public/_layout': typeof PublicLayoutRouteWithChildren
  '/_public/_layout/login': typeof PublicLayoutLoginRoute
  '/_public/_layout/signup': typeof PublicLayoutSignupRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '' | '/login' | '/signup'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '' | '/login' | '/signup'
  id:
    | '__root__'
    | '/'
    | '/_public/_layout'
    | '/_public/_layout/login'
    | '/_public/_layout/signup'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  PublicLayoutRoute: typeof PublicLayoutRouteWithChildren
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  PublicLayoutRoute: PublicLayoutRouteWithChildren,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/_public/_layout"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/_public/_layout": {
      "filePath": "_public/_layout.tsx",
      "children": [
        "/_public/_layout/login",
        "/_public/_layout/signup"
      ]
    },
    "/_public/_layout/login": {
      "filePath": "_public/_layout/login.tsx",
      "parent": "/_public/_layout"
    },
    "/_public/_layout/signup": {
      "filePath": "_public/_layout/signup.tsx",
      "parent": "/_public/_layout"
    }
  }
}
ROUTE_MANIFEST_END */
