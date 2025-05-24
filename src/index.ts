import { Hono } from 'hono';
import { Bindings } from './types';
import { discoveryRoutes } from './routes/discovery';
import { authRoutes } from './routes/auth';
import { tokenRoutes } from './routes/token';
import { userinfoRoutes } from './routes/userinfo';

const app = new Hono<{ Bindings: Bindings }>();

app.route('', discoveryRoutes);
app.route('', authRoutes);
app.route('', tokenRoutes);
app.route('', userinfoRoutes);

export default app;
