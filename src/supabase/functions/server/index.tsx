import app from './coconut-v14-routes.ts';
import fluxRoutes from './coconut-v14-flux-routes.ts';
import orchestratorRoutes from './coconut-v14-orchestrator-routes.ts';
import generationRoutes from './routes-generation.tsx';
import historyRoutes from './routes-history.tsx';
import dashboardRoutes from './coconut-v14-dashboard-routes.ts';
import cocoBoardRoutes from './coconut-v14-cocoboard-routes.ts';
import { initializeStorageBuckets } from './coconut-v14-storage.ts';

// ============================================
// MOUNT ROUTES
// ============================================

app.route('/', fluxRoutes);
app.route('/', orchestratorRoutes);
app.route('/', generationRoutes);
app.route('/', historyRoutes);
app.route('/', dashboardRoutes);
app.route('/', cocoBoardRoutes);