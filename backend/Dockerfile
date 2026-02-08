FROM node:18 AS build
WORKDIR /build

# Backend dependencies
COPY backend/package*.json backend/
RUN cd backend && npm install --production

# Copy backend source
COPY backend/ backend/

# Frontend build
COPY frontend/package*.json frontend/
# Install frontend deps without optional native packages (avoids rollup native module issue)
RUN cd frontend && npm install --no-optional --no-audit --no-fund
COPY frontend/ frontend/
# Build frontend
RUN cd frontend && npm run build

# Final runtime image
FROM node:18
WORKDIR /app

# copy backend app + node_modules
COPY --from=build /build/backend /app
COPY --from=build /build/backend/node_modules /app/node_modules

# copy frontend build
COPY --from=build /build/frontend/dist /app/frontend/dist

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]