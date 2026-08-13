// Mock client that redirects database and RPC calls to the Express server API
export const insforge = {
  database: {
    from(table: string) {
      // Map 'users_list' table name to users API endpoint
      const endpoint = table === 'users_list' ? 'users' : table;
      
      return {
        select(fields: string = '*') {
          let filters: Array<{ field: string; value: any }> = [];
          
          const execute = async () => {
            try {
              const res = await fetch(`/api/${endpoint}`);
              if (!res.ok) throw new Error(`HTTP error ${res.status}`);
              let data = await res.json();
              
              if (Array.isArray(data)) {
                filters.forEach(f => {
                  if (f.field === 'email') {
                    data = data.filter((item: any) => 
                      item.email && String(item.email).trim().toLowerCase() === String(f.value).trim().toLowerCase()
                    );
                  } else {
                    data = data.filter((item: any) => String(item[f.field]) === String(f.value));
                  }
                });
              }
              
              return { data, error: null };
            } catch (error: any) {
              console.error(`Error in select for ${table}:`, error);
              return { data: null, error };
            }
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
            try {
              const res = await fetch(`/api/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(records)
              });
              if (!res.ok) throw new Error(`HTTP error ${res.status}`);
              const data = await res.json();
              return { data, error: null };
            } catch (error: any) {
              console.error(`Error in insert for ${table}:`, error);
              return { data: null, error };
            }
          })();
        },
        
        update(updateData: any) {
          return {
            eq(field: string, value: any) {
              return (async () => {
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
                  console.error(`Error in update for ${table}:`, error);
                  return { data: null, error };
                }
              })();
            }
          };
        },
        
        delete() {
          return {
            eq(field: string, value: any) {
              return (async () => {
                try {
                  const url = field === 'id' 
                    ? `/api/${endpoint}/${value}` 
                    : `/api/${endpoint}?field=${field}&value=${value}`;
                    
                  const res = await fetch(url, {
                    method: 'DELETE'
                  });
                  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
                  const data = await res.json();
                  return { data, error: null };
                } catch (error: any) {
                  console.error(`Error in delete for ${table}:`, error);
                  return { data: null, error };
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
      console.error(`Error in RPC ${name}:`, error);
      return { data: null, error };
    }
  }
};
