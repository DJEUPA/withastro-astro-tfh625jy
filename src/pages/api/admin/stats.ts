import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ cookies }) => {
  const token = cookies.get('admin_token')?.value;
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({
    architecture: 0,
    construction: 0,
    total: 0
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};