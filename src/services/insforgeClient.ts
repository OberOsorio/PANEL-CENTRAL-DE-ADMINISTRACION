const DEFAULT_SEED_USERS = [
  {
    id: 'u-admin-1',
    email: 'admin@campana.ai',
    first_name: 'Santiago',
    last_name: 'Pérez',
    name: 'Santiago Pérez (Admin)',
    role_id: 'admin',
    role_name: 'Gestión Administrativa',
    client_id: 'client-101',
    client_name: 'Campaña Principal',
    status: 'Activo',
    created_at: new Date().toISOString(),
    password: 'admin2026'
  },
  {
    id: 'u-admin-2',
    email: 'ober.osorio@campana.ai',
    first_name: 'Ober',
    last_name: 'Osorio',
    name: 'Ober Osorio',
    role_id: 'admin',
    role_name: 'Gestión Administrativa',
    client_id: 'client-101',
    client_name: 'Campaña Principal',
    status: 'Activo',
    created_at: new Date().toISOString(),
    password: 'password'
  },
  {
    id: 'u-admin-3',
    email: 'santiago.perez@campana.ai',
    first_name: 'Santiago',
    last_name: 'Pérez',
    name: 'Santiago Pérez',
    role_id: 'admin',
    role_name: 'Gestión Administrativa',
    client_id: 'client-101',
    client_name: 'Campaña Principal',
    status: 'Activo',
    created_at: new Date().toISOString(),
    password: 'password'
  },
  {
    id: 'u-estrategico-1',
    email: 'estrategia@campana.ai',
    first_name: 'Elena',
    last_name: 'Rostova',
    name: 'Dra. Elena Rostova',
    role_id: 'estrategico',
    role_name: 'Gestión Estratégica',
    client_id: 'client-101',
    client_name: 'Campaña Principal',
    status: 'Activo',
    created_at: new Date().toISOString(),
    password: 'estrategia2026'
  },
  {
    id: 'u-territorial-1',
    email: 'territorio@campana.ai',
    first_name: 'Carlos',
    last_name: 'Mendoza',
    name: 'Carlos Mendoza',
    role_id: 'territorial',
    role_name: 'Gestión Territorial',
    client_id: 'client-101',
    client_name: 'Campaña Principal',
    status: 'Activo',
    created_at: new Date().toISOString(),
    password: 'territorio2026'
  }
];

function getNormalizedLocalUsers(): any[] {
  const usersMap = new Map<string, any>();

  DEFAULT_SEED_USERS.forEach(u => usersMap.set(u.email.toLowerCase().trim(), u));

  const keys = ['campaign_users_list', 'cg_users', 'campaign_users'];
  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach(item => {
          if (!item || (!item.email && !item.id)) return;
          const email = (item.email || '').trim().toLowerCase();
          const id = item.id || `u-${email}`;
          const existing = usersMap.get(email) || usersMap.get(id) || {};
          
          const fullName = item.name || `${item.first_name || item.firstName || ''} ${item.last_name || item.lastName || ''}`.trim() || email.split('@')[0];
          const firstName = item.first_name || item.firstName || (fullName ? fullName.split(' ')[0] : email.split('@')[0]);
          const lastName = item.last_name || item.lastName || (fullName && fullName.includes(' ') ? fullName.split(' ').slice(1).join(' ') : '');
          
          const roleId = item.role_id || item.roleId || item.role || existing.role_id || 'admin';
          const roleName = item.role_name || item.roleName || existing.role_name || (roleId === 'admin' ? 'Gestión Administrativa' : roleId === 'estrategico' ? 'Gestión Estratégica' : 'Gestión Territorial');
          
          const normalized = {
            ...existing,
            id,
            email,
            first_name: firstName,
            last_name: lastName,
            name: fullName,
            role_id: roleId,
            role_name: roleName,
            client_id: item.client_id || item.clientId || existing.client_id || 'client-101',
            client_name: item.client_name || item.clientName || existing.client_name || 'Campaña Principal',
            status: item.status || existing.status || 'Activo',
            created_at: item.created_at || item.createdAt || existing.created_at || new Date().toISOString(),
            password: item.password || item.passwordHash || existing.password || 'password'
          };
          
          usersMap.set(email || id, normalized);
        });
      }
    } catch (e) {}
  }

  return Array.from(usersMap.values());
}

export function syncLocalUsersRecords(records: any[]) {
  if (!Array.isArray(records) || records.length === 0) return;
  const current = getNormalizedLocalUsers();
  const map = new Map<string, any>();
  current.forEach(u => map.set(u.email || u.id, u));
  
  records.forEach(r => {
    if (!r) return;
    const email = (r.email || '').trim().toLowerCase();
    const id = r.id || `u-${email}`;
    const fullName = r.name || `${r.first_name || r.firstName || ''} ${r.last_name || r.lastName || ''}`.trim() || email.split('@')[0];
    const firstName = r.first_name || r.firstName || (fullName ? fullName.split(' ')[0] : email.split('@')[0]);
    const lastName = r.last_name || r.lastName || (fullName && fullName.includes(' ') ? fullName.split(' ').slice(1).join(' ') : '');
    const roleId = r.role_id || r.roleId || r.role || 'admin';
    const roleName = r.role_name || r.roleName || (roleId === 'admin' ? 'Gestión Administrativa' : roleId === 'estrategico' ? 'Gestión Estratégica' : 'Gestión Territorial');

    const norm = {
      id,
      email,
      first_name: firstName,
      last_name: lastName,
      name: fullName,
      role_id: roleId,
      role_name: roleName,
      client_id: r.client_id || r.clientId || 'client-101',
      client_name: r.client_name || r.clientName || 'Campaña Principal',
      status: r.status || 'Activo',
      created_at: r.created_at || r.createdAt || new Date().toISOString(),
      password: r.password || r.passwordHash || 'password'
    };
    map.set(email || id, norm);
  });

  const allUsers = Array.from(map.values());
  localStorage.setItem('cg_users', JSON.stringify(allUsers));
  localStorage.setItem('campaign_users_list', JSON.stringify(allUsers.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role_id,
    status: u.status,
    password: u.password
  }))));
}

const getApiUrl = (endpoint: string) => {
  const customUrl = (import.meta as any).env?.VITE_API_URL;
  if (customUrl) return `${customUrl.replace(/\/$/, '')}/api/${endpoint}`;
  return `/api/${endpoint}`;
};

const safeFetch = async (endpoint: string, options?: RequestInit) => {
  const customUrl = (import.meta as any).env?.VITE_API_URL || '';
  if (!customUrl) {
    return null;
  }

  const primaryUrl = getApiUrl(endpoint);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 600);

  try {
    const res = await fetch(primaryUrl, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (err) {
    clearTimeout(timeoutId);
  }
  return null;
};

export const insforge = {
  database: {
    from(table: string) {
      const endpoint = table === 'users_list' ? 'users' : table;
      
      return {
        select(fields: string = '*') {
          let filters: Array<{ field: string; value: any }> = [];
          
          const execute = async () => {
            let data: any[] = [];
            try {
              const apiData = await safeFetch(endpoint);
              if (Array.isArray(apiData)) {
                data = apiData;
              }
            } catch (error) {}

            if (table === 'users_list' || table === 'users' || endpoint === 'users') {
              const localUsers = getNormalizedLocalUsers();
              const existingEmails = new Set(data.map(u => (u.email || '').trim().toLowerCase()));
              localUsers.forEach(lu => {
                if (!existingEmails.has(lu.email)) {
                  data.push(lu);
                }
              });
            } else if (data.length === 0) {
              const saved = localStorage.getItem(`cg_${endpoint}`);
              if (saved) {
                try { data = JSON.parse(saved); } catch (e) { data = []; }
              }
            }

            if (Array.isArray(data)) {
              filters.forEach(f => {
                if (f.field === 'email') {
                  const searchEmail = String(f.value).trim().toLowerCase();
                  data = data.filter((item: any) => 
                    item.email && String(item.email).trim().toLowerCase() === searchEmail
                  );
                } else {
                  data = data.filter((item: any) => String(item[f.field]) === String(f.value));
                }
              });
            }
            
            return { data, error: null };
          };

          return {
            eq(field: string, value: any) {
              filters.push({ field, value });
              return this;
            },
            then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
              return execute().then(onfulfilled, onrejected);
            },
            catch(onrejected?: (reason: any) => any) {
              return execute().catch(onrejected);
            }
          };
        },
        
        insert(records: any[]) {
          return (async () => {
            if (table === 'users_list' || table === 'users' || endpoint === 'users') {
              syncLocalUsersRecords(records);
            } else {
              try {
                const current = JSON.parse(localStorage.getItem(`cg_${endpoint}`) || '[]');
                const updated = [...records, ...current];
                localStorage.setItem(`cg_${endpoint}`, JSON.stringify(updated));
              } catch (e) {}
            }

            try {
              const data = await safeFetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(records)
              });
              return { data, error: null };
            } catch (error: any) {
              return { data: records, error: null };
            }
          })();
        },
        
        update(updateData: any) {
          return {
            eq(field: string, value: any) {
              return (async () => {
                if (table === 'users_list' || table === 'users' || endpoint === 'users') {
                  const currentUsers = getNormalizedLocalUsers();
                  const updated = currentUsers.map(u => {
                    if (String(u[field]) === String(value)) {
                      return { ...u, ...updateData };
                    }
                    return u;
                  });
                  syncLocalUsersRecords(updated);
                }
                try {
                  const url = field === 'id' 
                    ? `/api/${endpoint}/${value}` 
                    : `/api/${endpoint}?field=${field}&value=${value}`;
                  
                  const res = await fetch(url, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateData)
                  });
                  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
                  const data = await res.json();
                  return { data, error: null };
                } catch (error: any) {
                  return { data: updateData, error: null };
                }
              })();
            }
          };
        },
        
        delete() {
          return {
            eq(field: string, value: any) {
              return (async () => {
                if (table === 'users_list' || table === 'users' || endpoint === 'users') {
                  const currentUsers = getNormalizedLocalUsers().filter(u => String(u[field]) !== String(value));
                  localStorage.setItem('cg_users', JSON.stringify(currentUsers));
                  localStorage.setItem('campaign_users_list', JSON.stringify(currentUsers.map(u => ({
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    role: u.role_id,
                    status: u.status,
                    password: u.password
                  }))));
                }
                try {
                  const url = field === 'id' 
                    ? `/api/${endpoint}/${value}` 
                    : `/api/${endpoint}?field=${field}&value=${value}`;
                    
                  const res = await fetch(url, { method: 'DELETE' });
                  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
                  const data = await res.json();
                  return { data, error: null };
                } catch (error: any) {
                  return { data: null, error: null };
                }
              })();
            }
          };
        }
      };
    }
  },
  
  async rpc(name: string, params: any) {
    try {
      const res = await fetch(`/api/rpc/${name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: null };
    }
  }
};
