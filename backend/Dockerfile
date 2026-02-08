FROM node:18 AS build
WORKDIR /build

# backend deps
COPY backend/package*.json backend/
RUN cd backend && npm ci --production

# copy backend
COPY backend/ backend/

# Use a prebuilt frontend `dist` directory (build locally) to avoid native rollup binary issues
# Expectation: run `cd frontend && npm ci && npm run build` on the host before building the image
COPY frontend/dist /build/frontend/dist

# final runtime image
FROM node:18-alpine
WORKDIR /app
COPY --from=build /build/backend /app
COPY --from=build /build/backend/node_modules /app/node_modules
COPY --from=build /build/frontend/dist /app/frontend/dist
COPY --from=build /build/backend/public /app/public
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]