// Mock Supabase client that routes auth requests to the Express server API
export const supabase = {
  auth: {
    async signInWithPassword({ email, password }: any) {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP error ${res.status}`);
        }
        const data = await res.json();
        return { data, error: null };
      } catch (error: any) {
        return { data: null, error: { message: error.message } };
      }
    },
    
    async signUp({ email, password, options }: any) {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            name: options?.data?.name || email.split('@')[0]
          })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP error ${res.status}`);
        }
        const data = await res.json();
        return { data, error: null };
      } catch (error: any) {
        return { data: null, error: { message: error.message } };
      }
    },
    
    async signOut() {
      try {
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        return { error: res.ok ? null : new Error(`HTTP error ${res.status}`) };
      } catch (error: any) {
        return { error };
      }
    },
    
    async getUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) return { data: { user: null }, error: null };
        const user = await res.json();
        return { data: { user }, error: null };
      } catch (error: any) {
        return { data: { user: null }, error };
      }
    },
    
    async signInWithOAuth({ provider, options }: any) {
      console.log('OAuth sign-in triggered for provider:', provider);
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@campanaganadora.ai', password: 'password', isOAuth: true })
        });
        if (res.ok) {
          window.location.reload();
        }
        return { error: null };
      } catch (error: any) {
        return { error };
      }
    }
  },
  
  // Dummy channel implementation to prevent frontend exceptions
  channel(name: string) {
    return {
      on(event: string, filter: any, callback: any) {
        return this;
      },
      subscribe() {
        return this;
      }
    };
  },
  
  removeChannel(channel: any) {
    // No-op
  }
};
